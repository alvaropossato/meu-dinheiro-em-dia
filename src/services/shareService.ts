import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  arrayUnion,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Goal, SharedGoalProjection } from '../types';
import { createSafePublicProjection } from '../utils/finance';

/**
 * Cria um link/código de compartilhamento seguro de progresso.
 * Garante que APENAS campos autorizados (percentuais, título público, status) sejam salvos.
 */
export async function createGoalShare(
  goal: Goal,
  ownerDisplayName: string,
  options?: {
    customPublicTitle?: string;
    guestEmail?: string;
  }
): Promise<SharedGoalProjection> {
  const shareId = 'share_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  // Código curto e amigável para convite manual
  const inviteCode = 'META-' + Math.random().toString(36).substring(2, 7).toUpperCase();

  const allowedGuestEmails = options?.guestEmail ? [options.guestEmail.trim().toLowerCase()] : [];

  const safeProjection = createSafePublicProjection(
    goal,
    ownerDisplayName,
    shareId,
    inviteCode,
    {
      customPublicTitle: options?.customPublicTitle,
      allowedGuestEmails,
      allowedGuestUids: [],
    }
  );

  try {
    await setDoc(doc(db, 'shared_goals', shareId), safeProjection);
    return safeProjection;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `shared_goals/${shareId}`);
  }
}

/**
 * Revoga imediatamente um compartilhamento.
 */
export async function revokeGoalShare(shareId: string, ownerId: string): Promise<void> {
  try {
    const shareRef = doc(db, 'shared_goals', shareId);
    await updateDoc(shareRef, {
      revoked: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `shared_goals/${shareId}`);
  }
}

/**
 * Exclui permanentemente um compartilhamento.
 */
export async function deleteGoalShare(shareId: string, ownerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'shared_goals', shareId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `shared_goals/${shareId}`);
  }
}

/**
 * Lista todos os compartilhamentos ativos criados pelo proprietário para determinada meta.
 */
export async function getGoalShares(goalId: string, ownerId: string): Promise<SharedGoalProjection[]> {
  try {
    const q = query(
      collection(db, 'shared_goals'),
      where('goalId', '==', goalId),
      where('ownerId', '==', ownerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SharedGoalProjection);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'shared_goals');
  }
}

/**
 * Resgata uma meta compartilhada através de código de convite.
 * Vincula o convidado autenticado à projeção pública.
 */
export async function redeemInviteCode(
  inviteCode: string,
  guestUid: string,
  guestEmail: string | null
): Promise<SharedGoalProjection> {
  const cleanCode = inviteCode.trim().toUpperCase();
  try {
    const q = query(collection(db, 'shared_goals'), where('inviteCode', '==', cleanCode));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error('Código de convite não encontrado ou inválido.');
    }

    const shareDoc = snap.docs[0];
    const data = shareDoc.data() as SharedGoalProjection;

    if (data.revoked) {
      throw new Error('Este compartilhamento foi revogado pelo proprietário da meta.');
    }

    // Se o convite for restrito por e-mail, valida
    if (data.allowedGuestEmails && data.allowedGuestEmails.length > 0) {
      const emailLower = guestEmail ? guestEmail.toLowerCase() : '';
      if (!data.allowedGuestEmails.includes(emailLower)) {
        throw new Error('Este convite foi enviado exclusivamente para outro endereço de e-mail.');
      }
    }

    // Registra o UID do convidado para acesso futuro sem precisar digitar o código novamente
    if (!data.allowedGuestUids?.includes(guestUid)) {
      await updateDoc(shareDoc.ref, {
        allowedGuestUids: arrayUnion(guestUid),
      });
      data.allowedGuestUids = [...(data.allowedGuestUids || []), guestUid];
    }

    return data;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('inválido') || error.message.includes('revogado') || error.message.includes('exclusivamente'))) {
      throw error;
    }
    handleFirestoreError(error, OperationType.GET, 'shared_goals');
  }
}

/**
 * Busca todas as metas compartilhadas com o usuário autenticado (onde ele é convidado).
 */
export async function getSharedGoalsForGuest(guestUid: string, guestEmail: string | null): Promise<SharedGoalProjection[]> {
  try {
    const results: Map<string, SharedGoalProjection> = new Map();

    // 1. Busca por UID
    const qUid = query(
      collection(db, 'shared_goals'),
      where('allowedGuestUids', 'array-contains', guestUid)
    );
    const snapUid = await getDocs(qUid);
    snapUid.docs.forEach((d) => {
      const item = d.data() as SharedGoalProjection;
      if (!item.revoked) results.set(item.id, item);
    });

    // 2. Busca por e-mail se disponível
    if (guestEmail) {
      const qEmail = query(
        collection(db, 'shared_goals'),
        where('allowedGuestEmails', 'array-contains', guestEmail.toLowerCase())
      );
      const snapEmail = await getDocs(qEmail);
      snapEmail.docs.forEach((d) => {
        const item = d.data() as SharedGoalProjection;
        if (!item.revoked) results.set(item.id, item);
      });
    }

    return Array.from(results.values());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'shared_goals');
  }
}

/**
 * Busca uma projeção pública específica por ID.
 */
export async function getSharedGoalById(shareId: string): Promise<SharedGoalProjection | null> {
  try {
    const snap = await getDoc(doc(db, 'shared_goals', shareId));
    if (!snap.exists()) return null;
    const data = snap.data() as SharedGoalProjection;
    if (data.revoked) return null;
    return data;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `shared_goals/${shareId}`);
  }
}

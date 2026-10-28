import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Goal, GoalStatus, Movement } from '../types';
import { calculateGoalPercentages, getEncouragementMessage } from '../utils/finance';

/**
 * Cria uma nova meta privada para o usuário proprietário.
 */
export async function createGoal(
  ownerId: string,
  data: {
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    category: Goal['category'];
    color: string;
    icon?: string;
  }
): Promise<Goal> {
  const goalId = 'goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const now = new Date().toISOString();

  const isCompleted = data.currentAmount >= data.targetAmount;
  const newGoal: Goal = {
    id: goalId,
    ownerId,
    name: data.name.trim(),
    description: data.description?.trim() || '',
    targetAmount: Math.max(0.01, Number(data.targetAmount)),
    currentAmount: Math.max(0, Number(data.currentAmount)),
    deadline: data.deadline || '',
    category: data.category,
    color: data.color || '#2563eb',
    icon: data.icon || 'Target',
    status: isCompleted ? 'completed' : 'active',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'goals', goalId), newGoal);
    return newGoal;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `goals/${goalId}`);
  }
}

/**
 * Atualiza dados de uma meta privada e sincroniza eventuais projeções compartilhadas ativas.
 */
export async function updateGoal(
  goalId: string,
  ownerId: string,
  updates: Partial<Omit<Goal, 'id' | 'ownerId' | 'createdAt'>>
): Promise<void> {
  const now = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    ...updates,
    updatedAt: now,
  };

  try {
    await updateDoc(doc(db, 'goals', goalId), updatePayload);
    // Sincroniza projeção pública segura se houver compartilhamento
    await syncGoalShares(goalId, ownerId, updates.targetAmount, updates.currentAmount, updates.name, updates.status);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `goals/${goalId}`);
  }
}

/**
 * Exclui uma meta privada e limpa movimentações e compartilhamentos relacionados.
 */
export async function deleteGoal(goalId: string, ownerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'goals', goalId));

    // Remove ou revoga compartilhamentos vinculados
    try {
      const q = query(collection(db, 'shared_goals'), where('goalId', '==', goalId), where('ownerId', '==', ownerId));
      const snap = await getDocs(q);
      for (const shareDoc of snap.docs) {
        await deleteDoc(shareDoc.ref);
      }
    } catch (e) {
      console.warn('Erro ao remover projeções compartilhadas da meta:', e);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `goals/${goalId}`);
  }
}

/**
 * Registra movimentação financeira privada (depósito ou retirada)
 * e atualiza o saldo economizado da meta.
 */
export async function addMovement(
  goal: Goal,
  type: 'deposit' | 'withdrawal',
  amount: number,
  description?: string,
  date?: string
): Promise<Movement> {
  const safeAmount = Math.max(0.01, Number(amount));
  const movementId = 'mov_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const now = new Date().toISOString();

  const newMovement: Movement = {
    id: movementId,
    goalId: goal.id,
    ownerId: goal.ownerId,
    type,
    amount: safeAmount,
    description: description?.trim() || '',
    date: date || new Date().toISOString().split('T')[0],
    createdAt: now,
  };

  // Calcula novo saldo
  let newCurrentAmount = goal.currentAmount;
  if (type === 'deposit') {
    newCurrentAmount += safeAmount;
  } else {
    newCurrentAmount = Math.max(0, newCurrentAmount - safeAmount);
  }

  const isCompleted = newCurrentAmount >= goal.targetAmount;
  const newStatus: GoalStatus = isCompleted ? 'completed' : goal.status === 'completed' ? 'active' : goal.status;

  try {
    // Grava movimentação
    await setDoc(doc(db, 'movements', movementId), newMovement);

    // Atualiza a meta com novo currentAmount
    await updateDoc(doc(db, 'goals', goal.id), {
      currentAmount: newCurrentAmount,
      status: newStatus,
      updatedAt: now,
    });

    // Sincroniza projeção pública sem nunca revelar valores monetários
    await syncGoalShares(goal.id, goal.ownerId, goal.targetAmount, newCurrentAmount, goal.name, newStatus);

    return newMovement;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `movements/${movementId}`);
  }
}

/**
 * Busca movimentações de uma meta privada
 */
export async function getGoalMovements(goalId: string, ownerId: string): Promise<Movement[]> {
  try {
    const q = query(
      collection(db, 'movements'),
      where('goalId', '==', goalId),
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Movement);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'movements');
  }
}

/**
 * Sincroniza o percentual das projeções compartilhadas mantendo confidencialidade total dos valores em R$.
 */
async function syncGoalShares(
  goalId: string,
  ownerId: string,
  targetAmount?: number,
  currentAmount?: number,
  title?: string,
  status?: GoalStatus
) {
  try {
    const q = query(
      collection(db, 'shared_goals'),
      where('goalId', '==', goalId),
      where('ownerId', '==', ownerId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return;

    if (targetAmount !== undefined && currentAmount !== undefined) {
      const { progressPercentage, remainingPercentage, isCompleted } = calculateGoalPercentages(
        targetAmount,
        currentAmount
      );
      const encMessage = getEncouragementMessage(progressPercentage, remainingPercentage);

      for (const d of snap.docs) {
        const updateData: Record<string, any> = {
          progressPercentage,
          remainingPercentage,
          status: isCompleted ? 'completed' : status || 'active',
          encouragementMessage: encMessage,
          updatedAt: new Date().toISOString(),
        };
        if (title) {
          updateData.publicTitle = title;
        }
        await updateDoc(d.ref, updateData);
      }
    }
  } catch (err) {
    console.warn('Erro ao sincronizar projeções compartilhadas:', err);
  }
}

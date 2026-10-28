import React, { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import {
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db } from './firebase';
import {
  Goal,
  GoalCategory,
  GoalStatus,
  SharedGoalProjection,
  Transaction,
  TransactionType,
  CategoryBudget,
} from './types';
import {
  calculateSummaryMetrics,
  calculateCashFlowMetrics,
} from './utils/finance';
import { createGoal, updateGoal, deleteGoal, addMovement } from './services/goalService';
import { redeemInviteCode, getSharedGoalsForGuest } from './services/shareService';
import {
  initOfflineStorage,
  getAllTransactions,
  saveTransaction,
  removeTransaction,
  getAllBudgets,
  saveBudget,
} from './services/offlineDb';

// Components
import { Navbar, AppTab } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { TransactionsView } from './components/TransactionsView';
import { PlanningView } from './components/PlanningView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { GoalModal } from './components/GoalModal';
import { MovementModal } from './components/MovementModal';
import { GoalHistoryModal } from './components/GoalHistoryModal';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TermsPrivacyModal } from './components/TermsPrivacyModal';
import { BrandLogo } from './components/BrandLogo';

function MainApp() {
  const { user, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<AppTab>('inicio');

  // Transações locais (IndexedDB)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);

  // Metas (Firestore e locais)
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [sharedGoals, setSharedGoals] = useState<SharedGoalProjection[]>([]);
  const [sharedLoading, setSharedLoading] = useState(false);

  // Modais de Transações e Orçamentos
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [defaultTransactionType, setDefaultTransactionType] = useState<TransactionType>('expense');

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<CategoryBudget | null>(null);

  // Modais de Metas
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementGoal, setMovementGoal] = useState<Goal | null>(null);
  const [defaultMovementType, setDefaultMovementType] = useState<'deposit' | 'withdrawal'>('deposit');

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyGoal, setHistoryGoal] = useState<Goal | null>(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareGoal, setShareGoal] = useState<Goal | null>(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);

  const [confirmDeleteTxOpen, setConfirmDeleteTxOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Código de convite da URL
  const [urlInviteCode, setUrlInviteCode] = useState<string>('');

  // 1. Inicializa o IndexedDB e carrega transações locais
  const loadLocalData = useCallback(async () => {
    try {
      await initOfflineStorage();
      const txs = await getAllTransactions();
      const bgs = await getAllBudgets();
      setTransactions(txs);
      setBudgets(bgs);
    } catch (err) {
      console.error('Erro ao inicializar IndexedDB:', err);
    }
  }, []);

  useEffect(() => {
    loadLocalData();
  }, [loadLocalData]);

  // Checa parâmetros de URL ao carregar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteParam = params.get('invite');
    if (inviteParam) {
      setUrlInviteCode(inviteParam.toUpperCase());
      setActiveTab('planejamento');
    }
  }, []);

  // 2. Escuta metas privadas do usuário no Firestore (ou fallback limpo se não autenticado)
  useEffect(() => {
    if (!user) {
      setGoals([]);
      setGoalsLoading(false);
      return;
    }

    setGoalsLoading(true);
    const q = query(
      collection(db, 'goals'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => doc.data() as Goal);
        setGoals(items);
        setGoalsLoading(false);
      },
      (error) => {
        console.error('Erro ao escutar metas do Firestore:', error);
        setGoalsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 3. Carrega metas compartilhadas onde o usuário é convidado
  const refreshSharedGoals = async () => {
    if (!user) {
      setSharedGoals([]);
      return;
    }
    setSharedLoading(true);
    try {
      const items = await getSharedGoalsForGuest(user.uid, user.email);
      setSharedGoals(items || []);
    } catch (err) {
      console.warn('Erro ao carregar metas compartilhadas:', err);
    } finally {
      setSharedLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'planejamento') {
      refreshSharedGoals();
    }
  }, [user, activeTab]);

  // Resgate de convite
  const handleRedeemInvite = async (code: string) => {
    if (!user) {
      setAuthModalOpen(true);
      throw new Error('Você precisa estar conectado para acompanhar uma meta compartilhada.');
    }
    await redeemInviteCode(code, user.uid, user.email);
    await refreshSharedGoals();
  };

  // --- CRUD DE TRANSAÇÕES LOCAIS (IndexedDB) ---
  const handleSaveTransactionSubmit = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      const updated: Transaction = {
        ...editingTransaction,
        ...data,
      };
      await saveTransaction(updated);
    } else {
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...data,
        createdAt: new Date().toISOString(),
      };
      await saveTransaction(newTx);
    }
    await loadLocalData();
  };

  const handleConfirmDeleteTransaction = async () => {
    if (!deletingTransaction) return;
    await removeTransaction(deletingTransaction.id);
    setConfirmDeleteTxOpen(false);
    setDeletingTransaction(null);
    await loadLocalData();
  };

  // --- CRUD DE ORÇAMENTOS ---
  const handleSaveBudgetSubmit = async (budget: CategoryBudget) => {
    await saveBudget(budget);
    await loadLocalData();
  };

  // --- CRUD DE METAS (Firestore) ---
  const handleSaveGoal = async (data: {
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    category: GoalCategory;
    color: string;
  }) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (editingGoal) {
      await updateGoal(editingGoal.id, user.uid, data);
    } else {
      await createGoal(user.uid, data);
    }
  };

  const handleMovementSubmit = async (data: {
    type: 'deposit' | 'withdrawal';
    amount: number;
    description?: string;
    date: string;
  }) => {
    if (!movementGoal || !user) return;
    await addMovement(movementGoal, data.type, data.amount, data.description, data.date);
  };

  const handleToggleStatus = async (goal: Goal) => {
    if (!user) return;
    const newStatus: GoalStatus = goal.status === 'active' ? 'paused' : 'active';
    await updateGoal(goal.id, user.uid, { status: newStatus });
  };

  const handleConfirmDelete = async () => {
    if (!deletingGoal || !user) return;
    try {
      await deleteGoal(deletingGoal.id, user.uid);
      setConfirmDeleteOpen(false);
      setDeletingGoal(null);
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Estudante';
  const cashflow = calculateCashFlowMetrics(transactions);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#202124] flex flex-col font-sans">
      {/* Indicador de Status Offline */}
      <OfflineIndicator />

      {/* Barra de Navegação Superior e Inferior */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
        sharedCount={sharedGoals.length}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Banner de Instalação do PWA (no topo do dashboard) */}
        <PWAInstallButton variant="banner" />

        {/* 1. ABA INÍCIO */}
        {activeTab === 'inicio' && (
          <HomeView
            displayName={displayName}
            transactions={transactions}
            goals={goals}
            onOpenNewTransaction={(type) => {
              setEditingTransaction(null);
              setDefaultTransactionType(type);
              setTransactionModalOpen(true);
            }}
            onOpenNewGoal={() => {
              if (!user) {
                setAuthModalOpen(true);
                return;
              }
              setEditingGoal(null);
              setGoalModalOpen(true);
            }}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onContributeGoal={(goal) => {
              setMovementGoal(goal);
              setDefaultMovementType('deposit');
              setMovementModalOpen(true);
            }}
          />
        )}

        {/* 2. ABA MOVIMENTAÇÕES */}
        {activeTab === 'movimentacoes' && (
          <TransactionsView
            transactions={transactions}
            onOpenNewTransaction={(type = 'expense') => {
              setEditingTransaction(null);
              setDefaultTransactionType(type);
              setTransactionModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setDefaultTransactionType(tx.type);
              setTransactionModalOpen(true);
            }}
            onDeleteTransaction={(tx) => {
              setDeletingTransaction(tx);
              setConfirmDeleteTxOpen(true);
            }}
          />
        )}

        {/* 3. ABA PLANEJAMENTO (METAS + ORÇAMENTOS + COMPARTILHADAS) */}
        {activeTab === 'planejamento' && (
          <PlanningView
            goals={goals}
            budgets={budgets}
            transactions={transactions}
            sharedGoals={sharedGoals}
            sharedLoading={sharedLoading}
            urlInviteCode={urlInviteCode}
            onOpenNewGoal={() => {
              if (!user) {
                setAuthModalOpen(true);
                return;
              }
              setEditingGoal(null);
              setGoalModalOpen(true);
            }}
            onOpenNewBudget={(budget) => {
              setEditingBudget(budget || null);
              setBudgetModalOpen(true);
            }}
            onContributeGoal={(g) => {
              setMovementGoal(g);
              setDefaultMovementType('deposit');
              setMovementModalOpen(true);
            }}
            onWithdrawGoal={(g) => {
              setMovementGoal(g);
              setDefaultMovementType('withdrawal');
              setMovementModalOpen(true);
            }}
            onShareGoal={(g) => {
              setShareGoal(g);
              setShareModalOpen(true);
            }}
            onHistoryGoal={(g) => {
              setHistoryGoal(g);
              setHistoryModalOpen(true);
            }}
            onEditGoal={(g) => {
              setEditingGoal(g);
              setGoalModalOpen(true);
            }}
            onToggleStatusGoal={handleToggleStatus}
            onDeleteGoal={(g) => {
              setDeletingGoal(g);
              setConfirmDeleteOpen(true);
            }}
            onRedeemInviteCode={handleRedeemInvite}
          />
        )}

        {/* 4. ABA RELATÓRIOS */}
        {activeTab === 'relatorios' && <ReportsView transactions={transactions} />}

        {/* 5. ABA CONFIGURAÇÕES */}
        {activeTab === 'configuracoes' && (
          <SettingsView
            onDataChanged={loadLocalData}
            onOpenPrivacyTerms={() => setTermsModalOpen(true)}
          />
        )}
      </main>

      {/* Rodapé Educativo */}
      <footer className="mt-auto border-t border-[#E7E9ED] bg-white py-6 text-center text-xs text-[#707782]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={28} />
            <span className="font-bold text-[#202124]">Meu Dinheiro em Dia</span>
            <span className="text-[#707782]">— Idealizado por alunos do 8º ano</span>
          </div>

          <div className="text-[11px] text-[#707782] flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTermsModalOpen(true)}
              className="hover:text-[#FF6B00] transition-colors cursor-pointer"
            >
              Termos de Uso & Privacidade
            </button>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#159957]" /> Proteção de dados
            </span>
          </div>
        </div>
      </footer>

      {/* --- MODAIS GLOBAIS --- */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransactionSubmit}
        initialTransaction={editingTransaction}
        defaultType={defaultTransactionType}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => {
          setBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudgetSubmit}
        initialBudget={editingBudget}
      />

      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => {
          setGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        initialGoal={editingGoal}
      />

      <MovementModal
        isOpen={movementModalOpen}
        onClose={() => {
          setMovementModalOpen(false);
          setMovementGoal(null);
        }}
        goal={movementGoal}
        defaultType={defaultMovementType}
        onSubmit={handleMovementSubmit}
      />

      <GoalHistoryModal
        isOpen={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setHistoryGoal(null);
        }}
        goal={historyGoal}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setShareGoal(null);
        }}
        goal={shareGoal}
        ownerDisplayName={displayName}
      />

      <TermsPrivacyModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />

      {/* Confirmação de Exclusão de Meta */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Excluir meta financeira"
        message={`Tem certeza de que deseja excluir a meta "${deletingGoal?.name}"? Esta ação removerá o registro e cancelará os convites de acompanhamento.`}
        confirmLabel="Sim, excluir meta"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmDeleteOpen(false);
          setDeletingGoal(null);
        }}
      />

      {/* Confirmação de Exclusão de Movimentação */}
      <ConfirmDialog
        isOpen={confirmDeleteTxOpen}
        title="Excluir movimentação"
        message={`Tem certeza de que deseja excluir "${deletingTransaction?.description}"? O valor será removido do cálculo de saldo.`}
        confirmLabel="Sim, excluir movimentação"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmDeleteTransaction}
        onCancel={() => {
          setConfirmDeleteTxOpen(false);
          setDeletingTransaction(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

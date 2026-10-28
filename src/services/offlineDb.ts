import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Transaction, CategoryBudget, TransactionCategory } from '../types';

interface MeuDinheiroDB extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
    indexes: { 'by-date': string; 'by-type': string; 'by-category': string };
  };
  budgets: {
    key: string; // category
    value: CategoryBudget;
  };
  preferences: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'meu-dinheiro-em-dia-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MeuDinheiroDB>> | null = null;

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo-tx-1',
    type: 'income',
    description: 'Mesada / Ajuda familiar para despesas escolares',
    amount: 150.0,
    category: 'mesada',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    paymentMethod: 'pix',
    notes: 'Exemplo demonstrativo do projeto escolar (8º ano).',
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-tx-2',
    type: 'expense',
    description: 'Caderno espiral e canetas para aulas de ciências',
    amount: 38.5,
    category: 'material_escolar',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    paymentMethod: 'dinheiro',
    notes: 'Comprado na papelaria do bairro.',
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-tx-3',
    type: 'expense',
    description: 'Lanche saudável e suco natural na cantina',
    amount: 14.0,
    category: 'alimentacao',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    paymentMethod: 'pix',
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-tx-4',
    type: 'income',
    description: 'Venda de trufas caseiras para arrecadar para passeio',
    amount: 85.0,
    category: 'vendas',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    paymentMethod: 'pix',
    notes: 'Empreendedorismo jovem e consumo consciente.',
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-tx-5',
    type: 'expense',
    description: 'Livro de literatura e materiais de desenho',
    amount: 29.9,
    category: 'material_escolar',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    paymentMethod: 'cartao_debito',
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-tx-6',
    type: 'expense',
    description: 'Passagem de ônibus ida e volta para a biblioteca pública',
    amount: 9.6,
    category: 'transporte',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'dinheiro',
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_BUDGETS: CategoryBudget[] = [
  { category: 'alimentacao', limitAmount: 120, month: new Date().toISOString().slice(0, 7) },
  { category: 'material_escolar', limitAmount: 80, month: new Date().toISOString().slice(0, 7) },
  { category: 'transporte', limitAmount: 50, month: new Date().toISOString().slice(0, 7) },
  { category: 'lazer', limitAmount: 60, month: new Date().toISOString().slice(0, 7) },
  { category: 'educacao', limitAmount: 100, month: new Date().toISOString().slice(0, 7) },
];

export function getDB(): Promise<IDBPDatabase<MeuDinheiroDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MeuDinheiroDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('by-date', 'date');
          txStore.createIndex('by-type', 'type');
          txStore.createIndex('by-category', 'category');
        }
        if (!db.objectStoreNames.contains('budgets')) {
          db.createObjectStore('budgets', { keyPath: 'category' });
        }
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function initOfflineStorage(): Promise<void> {
  const db = await getDB();
  const txCount = await db.count('transactions');
  if (txCount === 0) {
    const tx = db.transaction('transactions', 'readwrite');
    for (const item of DEMO_TRANSACTIONS) {
      await tx.store.put(item);
    }
    await tx.done;
  }

  const budgetCount = await db.count('budgets');
  if (budgetCount === 0) {
    const txB = db.transaction('budgets', 'readwrite');
    for (const b of DEFAULT_BUDGETS) {
      await txB.store.put(b);
    }
    await txB.done;
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const db = await getDB();
    const items = await db.getAll('transactions');
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error('Erro ao ler transações locais do IndexedDB:', err);
    return [];
  }
}

export async function saveTransaction(transaction: Transaction): Promise<void> {
  const db = await getDB();
  await db.put('transactions', transaction);
}

export async function removeTransaction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('transactions', id);
}

export async function clearAllTransactions(): Promise<void> {
  const db = await getDB();
  await db.clear('transactions');
}

export async function restoreDemoTransactions(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('transactions', 'readwrite');
  await tx.store.clear();
  for (const item of DEMO_TRANSACTIONS) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function getAllBudgets(): Promise<CategoryBudget[]> {
  try {
    const db = await getDB();
    return await db.getAll('budgets');
  } catch (err) {
    console.error('Erro ao ler orçamentos:', err);
    return DEFAULT_BUDGETS;
  }
}

export async function saveBudget(budget: CategoryBudget): Promise<void> {
  const db = await getDB();
  await db.put('budgets', budget);
}

export async function exportAllDataJSON(): Promise<string> {
  const db = await getDB();
  const transactions = await db.getAll('transactions');
  const budgets = await db.getAll('budgets');
  return JSON.stringify(
    {
      app: 'Meu Dinheiro em Dia',
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
    },
    null,
    2
  );
}

export async function importDataJSON(jsonStr: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.transactions || !Array.isArray(data.transactions)) {
      return { success: false, count: 0, error: 'Formato de arquivo inválido. Faltando lista de transações.' };
    }
    const db = await getDB();
    const tx = db.transaction('transactions', 'readwrite');
    for (const item of data.transactions) {
      if (item.id && item.type && item.amount) {
        await tx.store.put(item);
      }
    }
    await tx.done;

    if (data.budgets && Array.isArray(data.budgets)) {
      const txB = db.transaction('budgets', 'readwrite');
      for (const b of data.budgets) {
        if (b.category && b.limitAmount) {
          await txB.store.put(b);
        }
      }
      await txB.done;
    }

    return { success: true, count: data.transactions.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Erro ao processar JSON.' };
  }
}

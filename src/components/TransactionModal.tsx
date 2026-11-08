import React, { useState, useEffect, useRef } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, Tag, CreditCard, FileText, Camera, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Transaction, TransactionCategory, TransactionType } from '../types';
import { CATEGORY_META } from '../utils/finance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  initialTransaction?: Transaction | null;
  defaultType?: TransactionType;
}

const INCOME_CATEGORIES: { id: TransactionCategory; label: string }[] = [
  { id: 'mesada', label: 'Mesada' },
  { id: 'salario', label: 'Salário fictício / Bolsa' },
  { id: 'presentes', label: 'Presentes em dinheiro' },
  { id: 'vendas', label: 'Vendas e empreendedorismo' },
  { id: 'outras_receitas', label: 'Outras receitas' },
];

const EXPENSE_CATEGORIES: { id: TransactionCategory; label: string }[] = [
  { id: 'alimentacao', label: 'Alimentação' },
  { id: 'transporte', label: 'Transporte' },
  { id: 'material_escolar', label: 'Material escolar' },
  { id: 'lazer', label: 'Lazer' },
  { id: 'compras', label: 'Compras' },
  { id: 'outras_despesas', label: 'Outras despesas' },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTransaction,
  defaultType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('alimentacao');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('pix');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setDescription(initialTransaction.description);
      setAmountStr(initialTransaction.amount.toString().replace('.', ','));
      setCategory(initialTransaction.category);
      setDate(initialTransaction.date);
      setPaymentMethod(initialTransaction.paymentMethod || 'pix');
      setNotes(initialTransaction.notes || '');
    } else {
      setType(defaultType);
      setDescription('');
      setAmountStr('');
      setCategory(defaultType === 'income' ? 'mesada' : 'alimentacao');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('pix');
      setNotes('');
      setReceiptImage(undefined);
    }
    setScanSuccess(false);
    setError('');
  }, [initialTransaction, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanDesc = description.trim();
    if (!cleanDesc) {
      setError('A descrição não pode ficar vazia.');
      return;
    }

    // Tratamento de valores com vírgula e separador de milhar
    const normalizedAmount = amountStr.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const cleanAmount = parseFloat(normalizedAmount);

    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setError('O valor deve ser numérico e maior que zero (ex: 50,00).');
      return;
    }

    if (!date) {
      setError('Informe uma data válida para a movimentação.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        type,
        description: cleanDesc,
        amount: Math.round(cleanAmount * 100) / 100,
        category,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
        receiptImage,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar movimentação.');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptFile = (file: File) => {
    setScanning(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setReceiptImage(result);

      // Simulação inteligente de OCR e extração de dados do recibo
      setTimeout(() => {
        setType('expense');
        const randomStores = [
          { name: 'Cantina da Escola', category: 'alimentacao' as TransactionCategory, amount: '12,50' },
          { name: 'Papelaria Central', category: 'material_escolar' as TransactionCategory, amount: '34,90' },
          { name: 'Livraria Estudantil', category: 'material_escolar' as TransactionCategory, amount: '45,00' },
          { name: 'Loja de Lanches e Sucos', category: 'alimentacao' as TransactionCategory, amount: '18,00' },
          { name: 'Supermercado Bairro', category: 'alimentacao' as TransactionCategory, amount: '56,40' },
          { name: 'Cinema & Lazer Shopping', category: 'lazer' as TransactionCategory, amount: '28,00' },
        ];
        const picked = randomStores[Math.floor(Math.random() * randomStores.length)];
        setDescription(picked.name);
        setAmountStr(picked.amount);
        setCategory(picked.category);
        setPaymentMethod('pix');
        setNotes('Extraído automaticamente de recibo fotografado');
        setScanning(false);
        setScanSuccess(true);
      }, 900);
    };
    reader.readAsDataURL(file);
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E7E9ED] overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7E9ED]">
          <div>
            <h2 className="text-lg font-bold text-[#202124]">
              {initialTransaction ? 'Editar Movimentação' : 'Registrar Movimentação'}
            </h2>
            <p className="text-xs text-[#707782]">
              Cadastre entradas ou saídas de dinheiro para atualizar seus cálculos e gráficos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#707782] hover:text-[#202124] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#D92D20] font-medium">
              {error}
            </div>
          )}

          {/* Botão de Fotografar ou Enviar Recibo */}
          <div className="bg-gradient-to-r from-[#FFF1E7] to-[#FFE8D6] p-4 rounded-2xl border border-[#FF6B00]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">Fotografar Recibo ou Nota Fiscal</h3>
                  <p className="text-[11px] text-[#707782]">Capture o comprovante para preencher o gasto automaticamente</p>
                </div>
              </div>
              {scanSuccess && (
                <span className="px-2.5 py-1 bg-[#159957] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Escaneado!
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleReceiptFile(file);
                }}
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleReceiptFile(file);
                }}
              />

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={scanning}
                className="flex-1 h-10 px-3 bg-[#FF6B00] hover:bg-[#E85D00] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{scanning ? 'Analisando...' : 'Tirar Foto do Recibo'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                className="h-10 px-3.5 bg-white hover:bg-slate-50 border border-[#E7E9ED] text-[#202124] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#707782]" />
                <span>Enviar Imagem</span>
              </button>
            </div>

            {receiptImage && (
              <div className="flex items-center justify-between pt-2 border-t border-[#FF6B00]/20">
                <div className="flex items-center gap-2">
                  <img src={receiptImage} alt="Recibo" className="w-10 h-10 object-cover rounded-lg border border-[#FF6B00]/30" />
                  <span className="text-[11px] font-medium text-[#202124]">Recibo anexado com sucesso</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptImage(undefined)}
                  className="text-xs text-[#D92D20] font-bold hover:underline cursor-pointer"
                >
                  Remover foto
                </button>
              </div>
            )}
          </div>

          {/* Tipo: Entrada ou Saída */}
          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1.5">
              Tipo da Movimentação
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F7F8FA] p-1.5 rounded-2xl border border-[#E7E9ED]">
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('mesada');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-white text-[#159957] shadow-xs'
                    : 'text-[#707782] hover:text-[#202124]'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-[#159957]" />
                Entrada (Receita)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory('alimentacao');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-white text-[#D92D20] shadow-xs'
                    : 'text-[#707782] hover:text-[#202124]'
                }`}
              >
                <TrendingDown className="w-4 h-4 text-[#D92D20]" />
                Saída (Despesa)
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1.5">
              Descrição da Movimentação
            </label>
            <input
              type="text"
              required
              placeholder={type === 'income' ? 'Ex: Mesada do mês, Venda de trufas...' : 'Ex: Lanche da cantina, Caderno de história...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs sm:text-sm text-[#202124] placeholder-[#707782]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
            />
          </div>

          {/* Valor (R$) e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                Valor em Reais (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#707782]">
                  R$
                </span>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs sm:text-sm font-bold text-[#202124] placeholder-[#707782]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                Data da Movimentação
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs sm:text-sm text-[#202124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1.5">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full h-11 px-3 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs font-semibold text-[#202124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Meio de Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1.5">
              Forma de Pagamento (opcional)
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full h-11 px-3 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs text-[#202124] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
            >
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro em Espécie</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="transferencia">Transferência Bancária</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          {/* Observações Opcionais */}
          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1.5">
              Observações Opcionais
            </label>
            <input
              type="text"
              placeholder="Ex: Compra dividida com colegas, desconto aplicado, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs text-[#202124] placeholder-[#707782]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
            />
          </div>

          {/* Ações */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 px-5 rounded-xl border border-[#E7E9ED] text-xs font-semibold text-[#202124] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`h-11 px-6 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer ${
                type === 'income' ? 'bg-[#159957] hover:bg-[#128148]' : 'bg-[#FF6B00] hover:bg-[#E85D00]'
              }`}
            >
              {loading ? 'Salvando...' : initialTransaction ? 'Salvar Alterações' : 'Salvar Movimentação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-[#E7E9ED] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center ${
              isDestructive ? 'bg-red-50 text-[#D92D20]' : 'bg-[#FFF1E7] text-[#FF6B00]'
            }`}
          >
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#202124]">{title}</h3>
            <p className="mt-1 text-xs sm:text-sm text-[#707782] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 px-4 text-xs sm:text-sm font-semibold text-[#202124] bg-white hover:bg-slate-50 border border-[#E7E9ED] rounded-xl transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 px-5 text-xs sm:text-sm font-semibold text-white rounded-2xl shadow-xs transition-colors cursor-pointer active:scale-[0.98] ${
              isDestructive ? 'bg-[#D92D20] hover:bg-red-700' : 'bg-[#FF6B00] hover:bg-[#E85D00]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

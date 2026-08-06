import React from 'react';

interface PromotionModalProps {
  isOpen: boolean;
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, color, onSelect, onCancel }) => {
  if (!isOpen) return null;

  const pieces = [
    { type: 'q', icon: color === 'w' ? '♕' : '♛', label: 'Menteri' },
    { type: 'r', icon: color === 'w' ? '♖' : '♜', label: 'Benteng' },
    { type: 'b', icon: color === 'w' ? '♗' : '♝', label: 'Gajah' },
    { type: 'n', icon: color === 'w' ? '♘' : '♞', label: 'Kuda' },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="bg-white rounded-2xl shadow-2xl z-10 p-5 min-w-[280px]">
        <h3 className="text-lg font-bold text-neutral-900 mb-4 text-center">Pilih Promosi Bidak</h3>
        <div className="grid grid-cols-2 gap-3">
          {pieces.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type as 'q' | 'r' | 'b' | 'n')}
              className="flex flex-col items-center justify-center p-4 bg-neutral-50 hover:bg-amber-50 border border-neutral-200 hover:border-amber-300 rounded-xl transition-colors cursor-pointer"
            >
              <span className="text-4xl mb-2">{p.icon}</span>
              <span className="text-xs font-semibold text-neutral-700">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

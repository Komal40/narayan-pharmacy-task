import type { DrugItem } from '../types';

interface Props {
  drug: DrugItem;
  index: number;
  onUpdate: (index: number, field: keyof DrugItem, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export default function DrugRow({ drug, index, onUpdate, onRemove, canRemove }: Props) {
  const inputStyle: React.CSSProperties = {
    padding: '8px 10px', border: '1px solid #D1D5DB',
    borderRadius: 6, fontSize: 14, outline: 'none',
    width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
      <input
        style={{ ...inputStyle, flex: 2 }}
        placeholder="Drug name (e.g. Metformin)"
        value={drug.name}
        onChange={(e) => onUpdate(index, 'name', e.target.value)}
      />
      <input
        style={{ ...inputStyle, flex: 1 }}
        placeholder="Dosage (e.g. 500mg)"
        value={drug.dosage}
        onChange={(e) => onUpdate(index, 'dosage', e.target.value)}
      />
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label="Remove drug"
          style={{
            background: 'none', border: '1px solid #FCA5A5',
            borderRadius: 6, cursor: 'pointer', color: '#EF4444',
            fontSize: 16, width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >✕</button>
      )}
    </div>
  );
}
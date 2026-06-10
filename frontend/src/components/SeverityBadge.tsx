import type { SeverityLevel } from '../types';

interface SeverityConfig {
  bg: string;
  color: string;
  dot: string;
  label: string;
}

const SEVERITY_MAP: Record<SeverityLevel, SeverityConfig> = {
  Severe:   { bg: '#FEE2E2', color: '#991B1B', dot: '#DC2626', label: '⚠ Severe' },
  Moderate: { bg: '#FEF3C7', color: '#92400E', dot: '#D97706', label: '◆ Moderate' },
  Mild:     { bg: '#FEF9C3', color: '#713F12', dot: '#CA8A04', label: '● Mild' },
  None:     { bg: '#DCFCE7', color: '#166534', dot: '#16A34A', label: '✓ No Interactions' },
};

interface Props {
  severity: SeverityLevel | null;
}

export default function SeverityBadge({ severity }: Props) {
  const config = SEVERITY_MAP[severity ?? 'None'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 999,
      backgroundColor: config.bg, color: config.color,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        backgroundColor: config.dot, flexShrink: 0,
      }} />
      {config.label}
    </span>
  );
}
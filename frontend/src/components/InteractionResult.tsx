import type { AiCheckedStatus, SeverityLevel, InteractionData } from '../types';
import SeverityBadge from './SeverityBadge';

interface Props {
  interactionResult: string | null;
  severity: SeverityLevel | null;
  aiChecked: AiCheckedStatus;
}

export default function InteractionResult({ interactionResult, severity, aiChecked }: Props) {
  // ─── Edge cases first ─────────────────────────────────────────────────────
  if (aiChecked === 'skipped') {
    return (
      <InfoBox bg="#EFF6FF" color="#1D4ED8">
        ℹ️ Only one drug prescribed — drug interaction check not applicable.
        Add 2+ medications to enable AI analysis.
      </InfoBox>
    );
  }

  if (aiChecked === 'error') {
    return (
      <InfoBox bg="#FFF7ED" color="#C2410C">
        ⚠️ AI interaction check could not be completed.
        Please verify this prescription manually before dispensing.
      </InfoBox>
    );
  }

  if (aiChecked === 'no' || !interactionResult) {
    return (
      <InfoBox bg="#F9FAFB" color="#6B7280">
        AI analysis not yet performed.
      </InfoBox>
    );
  }

  // ─── Parse Claude JSON result ─────────────────────────────────────────────
  let parsed: InteractionData;
  try {
    parsed = JSON.parse(interactionResult) as InteractionData;
  } catch {
    return <InfoBox bg="#FFF7ED" color="#C2410C">Could not display AI analysis.</InfoBox>;
  }

  if (parsed.error) {
    return <InfoBox bg="#FFF7ED" color="#C2410C">⚠️ {parsed.error}</InfoBox>;
  }

  return (
    <div style={{
      border: '1px solid #E5E7EB', borderRadius: 8,
      overflow: 'hidden', background: '#fff',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', background: '#F9FAFB',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>
          AI Interaction Analysis
        </span>
        <SeverityBadge severity={severity} />
      </div>

      {/* Body */}
      <div style={{ padding: 16 }}>
        <p style={{ color: '#374151', marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>
          {parsed.summary}
        </p>

        {/* Interaction cards */}
        {parsed.interactions?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{
              fontWeight: 600, marginBottom: 10, color: '#111827',
              fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Interactions Found
            </h4>
            {parsed.interactions.map((item, i) => (
              <div key={i} style={{
                background: '#FAFAFA',
                border: '1px solid #E5E7EB',
                borderLeft: '3px solid #DC2626',
                borderRadius: 6, padding: 12, marginBottom: 8,
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 8,
                }}>
                  <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>
                    {item.drugs_involved?.join(' + ')}
                  </span>
                  <SeverityBadge severity={item.severity} />
                </div>
                <p style={{ color: '#4B5563', fontSize: 13, marginBottom: 4, lineHeight: 1.5 }}>
                  <strong>Clinical Effect:</strong> {item.effect}
                </p>
                <p style={{ color: '#4B5563', fontSize: 13, lineHeight: 1.5 }}>
                  <strong>Recommendation:</strong> {item.recommendation}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* General advice */}
        {parsed.general_advice && (
          <p style={{
            color: '#6B7280', fontSize: 13, paddingTop: 12,
            borderTop: '1px solid #F3F4F6', lineHeight: 1.6,
          }}>
            📋 <strong>Dispensing Notes:</strong> {parsed.general_advice}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function InfoBox({
  bg, color, children,
}: {
  bg: string; color: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: bg, color,
      padding: '12px 16px', borderRadius: 8,
      fontSize: 14, lineHeight: 1.6,
    }}>
      {children}
    </div>
  );
}
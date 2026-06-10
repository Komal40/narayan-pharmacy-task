import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { PrescriptionDetail as PrescriptionDetailType } from '../types';
import { getPrescriptionById } from '../api/prescription';
import SeverityBadge from '../components/SeverityBadge';
import InteractionResult from '../components/InteractionResult';

export default function PrescriptionDetail() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();

  const [prescription, setPrescription] = useState<PrescriptionDetailType | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    if (!id) return;
    getPrescriptionById(Number(id))
      .then((res) => setPrescription(res.data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Prescription not found.')
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center', color: '#6B7280' }}>Loading...</div>;
  }

  if (error || !prescription) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: 16, borderRadius: 8 }}>
          {error || 'Prescription not found.'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/prescriptions')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6B7280', fontSize: 14, marginBottom: 20, padding: 0,
        }}
      >
        ← Back to all prescriptions
      </button>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            {prescription.patient_name}
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Prescription #{prescription.id} ·{' '}
            {new Date(prescription.date).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <SeverityBadge severity={prescription.severity} />
      </div>

      {/* Details card */}
      <div style={s.card}>
        <InfoRow label="Doctor" value={`Dr. ${prescription.doctor_name}`} />
        <InfoRow
          label="Date"
          value={new Date(prescription.date).toLocaleDateString('en-IN', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
          })}
        />
        <div style={{ marginTop: 16 }}>
          <span style={s.metaLabel}>Medications</span>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {prescription.drugs.map((drug, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={s.drugChip}>{drug.name}</span>
                <span style={s.dosageChip}>{drug.dosage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Result */}
      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
          Drug Interaction Analysis
        </h2>
        <InteractionResult
          interactionResult={prescription.interaction_result}
          severity={prescription.severity}
          aiChecked={prescription.ai_checked}
        />
      </div>

    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 10, alignItems: 'baseline' }}>
      <span style={{ ...s.metaLabel, minWidth: 70 }}>{label}</span>
      <span style={{ color: '#111827', fontSize: 14 }}>{value}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  card:       { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 20 },
  metaLabel:  {
    fontSize: 11, fontWeight: 700, color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  drugChip:   {
    background: '#EFF6FF', color: '#1D4ED8',
    padding: '3px 10px', borderRadius: 999, fontSize: 13, fontWeight: 500,
  },
  dosageChip: {
    background: '#F3F4F6', color: '#6B7280',
    padding: '3px 10px', borderRadius: 999, fontSize: 13,
  },
};
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DrugItem, PrescriptionDetail } from '../types';
import { createPrescription } from '../api/prescription';
import DrugRow from '../components/DrugRow';
import InteractionResult from '../components/InteractionResult';

export default function NewPrescription() {
  const navigate = useNavigate();

  // ─── Form state ────────────────────────────────────────────────────────────
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName]   = useState('');
  const [date, setDate]               = useState('');
  const [drugs, setDrugs]             = useState<DrugItem[]>([{ name: '', dosage: '' }]);

  // ─── UI state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState<PrescriptionDetail | null>(null);

  // ─── Drug row handlers ─────────────────────────────────────────────────────
  const addDrug = () =>
    setDrugs((prev) => [...prev, { name: '', dosage: '' }]);

  const removeDrug = (index: number) =>
    setDrugs((prev) => prev.filter((_, i) => i !== index));

  const updateDrug = (index: number, field: keyof DrugItem, value: string) =>
    setDrugs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!patientName.trim()) return 'Patient name is required.';
    if (!doctorName.trim())  return 'Doctor name is required.';
    if (!date)               return 'Prescription date is required.';
    if (drugs.some((d) => !d.name.trim() || !d.dosage.trim()))
      return 'Fill in all drug name and dosage fields.';
    return null;
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      // createPrescription from api/prescriptions.ts calls makeRequest internally
      const res = await createPrescription({
        patient_name: patientName,
        doctor_name: doctorName,
        date,
        drugs,
      });
      setResult(res.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save prescription. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={s.pageTitle}>New Prescription</h1>

      {/* ── Patient details ── */}
      <div style={s.card}>
        <h2 style={s.sectionTitle}>Patient Details</h2>
        <div style={{ display: 'grid', gap: 14 }}>
          <Field label="Patient Name">
            <input style={s.input} placeholder="Full name"
              value={patientName} onChange={(e) => setPatientName(e.target.value)} />
          </Field>
          <Field label="Prescribing Doctor">
            <input style={s.input} placeholder="Doctor full name"
              value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
          </Field>
          <Field label="Prescription Date">
            <input type="date" style={s.input}
              value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
      </div>

      {/* ── Medications ── */}
      <div style={{ ...s.card, marginTop: 14 }}>
        <h2 style={s.sectionTitle}>Medications</h2>
        {drugs.map((drug, i) => (
          <DrugRow
            key={i}
            drug={drug}
            index={i}
            onUpdate={updateDrug}
            onRemove={removeDrug}
            canRemove={drugs.length > 1}
          />
        ))}
        <button type="button" onClick={addDrug} style={s.ghostBtn}>
          + Add Drug
        </button>
        {drugs.length === 1 && (
          <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 8 }}>
            Add at least 2 drugs to enable AI interaction checking.
          </p>
        )}
      </div>

      {/* ── Error message ── */}
      {error && (
        <div style={{
          background: '#FEE2E2', color: '#991B1B',
          padding: '10px 14px', borderRadius: 6,
          marginTop: 12, fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* ── Submit button ── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        style={{
          ...s.primaryBtn, marginTop: 16, width: '100%',
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '⏳ Checking interactions with AI...' : 'Save & Check Interactions'}
      </button>

      {/* ── Result after submit ── */}
      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{
            background: '#DCFCE7', color: '#166534',
            padding: '10px 14px', borderRadius: 6,
            marginBottom: 16, fontSize: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>✅ Prescription saved.</span>
            <button
              type="button"
              onClick={() => navigate(`/prescriptions/${result.id}`)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#166534', fontWeight: 600, fontSize: 14,
                textDecoration: 'underline',
              }}
            >
              View full details →
            </button>
          </div>
          <InteractionResult
            interactionResult={result.interaction_result}
            severity={result.severity}
            aiChecked={result.ai_checked}
          />
        </div>
      )}
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  pageTitle:   { fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#111827' },
  card:        { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 20 },
  sectionTitle:{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: '#374151' },
  label:       { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 },
  input:       {
    width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB',
    borderRadius: 6, fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  ghostBtn:    {
    background: 'none', border: '1px dashed #9CA3AF', borderRadius: 6,
    padding: '7px 14px', cursor: 'pointer', color: '#6B7280', fontSize: 13, marginTop: 4,
  },
  primaryBtn:  {
    background: '#1D4ED8', color: '#fff', border: 'none',
    borderRadius: 8, padding: '12px 20px', fontSize: 15, fontWeight: 600, display: 'block',
  },
};
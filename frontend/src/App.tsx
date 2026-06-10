import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import NewPrescription     from './pages/NewPrescription';
import PrescriptionsList   from './pages/PrescriptionList';
import PrescriptionDetail  from './pages/PrescriptionDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: 'system-ui, sans-serif' }}>
        <Navbar />
        <Routes>
          <Route path="/"                    element={<Navigate to="/prescriptions" replace />} />
          <Route path="/new"                 element={<NewPrescription />} />
          <Route path="/prescriptions"       element={<PrescriptionsList />} />
          <Route path="/prescriptions/:id"   element={<PrescriptionDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function Navbar() {
  const base: React.CSSProperties = {
    textDecoration: 'none', fontSize: 14, fontWeight: 500,
    padding: '4px 0', borderBottom: '2px solid transparent',
    color: '#6B7280', transition: 'color 0.15s, border-color 0.15s',
  };

  return (
    <nav style={{
      borderBottom: '1px solid #E5E7EB', padding: '0 32px',
      display: 'flex', alignItems: 'center', gap: 28,
      height: 54, background: '#fff', position: 'sticky',
      top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <span style={{ fontWeight: 800, fontSize: 16, color: '#1D4ED8', letterSpacing: '-0.02em' }}>
        💊 PharmDesk
      </span>
      <NavLink to="/new" style={({ isActive }) => ({
        ...base,
        color: isActive ? '#1D4ED8' : '#6B7280',
        borderBottomColor: isActive ? '#1D4ED8' : 'transparent',
      })}>
        New Prescription
      </NavLink>
      <NavLink to="/prescriptions" style={({ isActive }) => ({
        ...base,
        color: isActive ? '#1D4ED8' : '#6B7280',
        borderBottomColor: isActive ? '#1D4ED8' : 'transparent',
      })}>
        All Prescriptions
      </NavLink>
    </nav>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import { MantineProvider } from '@mantine/core';
import type { PrescriptionListItem, SeverityLevel } from '../types';
import { getAllPrescriptions } from '../api/prescription';
import SeverityBadge from '../components/SeverityBadge';

export default function PrescriptionsList() {
  const navigate = useNavigate();
  const [data, setData]       = useState<PrescriptionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // ─── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    getAllPrescriptions()
      .then((res) => setData(res.data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load.')
      )
      .finally(() => setLoading(false));
  }, []);

  // ─── Column definitions ────────────────────────────────────────────────────
  const columns = useMemo<MRT_ColumnDef<PrescriptionListItem>[]>(() => [
    {
      accessorKey: 'patient_name',
      header: 'Patient',
      size: 180,
      Cell: ({ cell }) => (
        <span style={{ fontWeight: 600, color: '#111827' }}>
          {cell.getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'doctor_name',
      header: 'Doctor',
      size: 160,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      size: 130,
      Cell: ({ cell }) =>
        new Date(cell.getValue<string>()).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        }),
    },
    {
      accessorKey: 'drug_count',
      header: 'Drugs',
      size: 90,
      Cell: ({ cell }) => {
        const count = cell.getValue<number>();
        return (
          <span style={{
            background: '#EFF6FF', color: '#1D4ED8',
            padding: '2px 10px', borderRadius: 999, fontSize: 13, fontWeight: 500,
          }}>
            {count} drug{count !== 1 ? 's' : ''}
          </span>
        );
      },
    },
    {
      accessorKey: 'severity',
      header: 'AI Status',
      size: 160,
      Cell: ({ row }) => {
        const { ai_checked, severity } = row.original;
        if (ai_checked === 'skipped')
          return <span style={{ color: '#9CA3AF', fontSize: 13 }}>Single drug</span>;
        if (ai_checked === 'error')
          return <span style={{ color: '#EF4444', fontSize: 13 }}>⚠ Check failed</span>;
        if (ai_checked === 'no')
          return <span style={{ color: '#9CA3AF', fontSize: 13 }}>Pending</span>;
        return <SeverityBadge severity={severity as SeverityLevel} />;
      },
    },
  ], []);

  // ─── MRT table instance ────────────────────────────────────────────────────
  const table = useMantineReactTable({
    columns,
    data,
    state: { isLoading: loading },
    enableColumnActions:  false,
    enableColumnFilters:  true,
    enablePagination:     true,
    enableSorting:        true,
    enableGlobalFilter:   true,
    positionGlobalFilter: 'left',
    initialState: { pagination: { pageSize: 10, pageIndex: 0 } },

    // Row click → prescription detail
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => navigate(`/prescriptions/${row.original.id}`),
      style: { cursor: 'pointer' },
    }),

    // Top toolbar — "New Prescription" button
    renderTopToolbarCustomActions: () => (
      <button
        type="button"
        onClick={() => navigate('/new')}
        style={{
          background: '#1D4ED8', color: '#fff', border: 'none',
          borderRadius: 8, padding: '8px 16px',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        + New Prescription
      </button>
    ),

    // Empty state
    renderEmptyRowsFallback: () => (
      <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9CA3AF' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>💊</div>
        <p style={{ fontWeight: 500 }}>No prescriptions yet.</p>
        <p style={{ fontSize: 13 }}>
          Create your first prescription using the button above.
        </p>
      </div>
    ),
  });

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{
          background: '#FEE2E2', color: '#991B1B',
          padding: 16, borderRadius: 8,
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <MantineProvider>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#111827' }}>
          Prescriptions
        </h1>
        <MantineReactTable table={table} />
      </div>
    </MantineProvider>
  );
}
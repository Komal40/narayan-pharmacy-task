import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type MRT_ColumnDef } from "mantine-react-table";
import { MantineProvider } from "@mantine/core";
import type { PrescriptionListItem, SeverityLevel } from "../types";
import { getAllPrescriptions } from "../api/prescription";
import CommonTable from "../common/CommonTable";
import SeverityBadge from "../components/SeverityBadge";
import CommonButton from "../common/CommonButton";

export default function PrescriptionsList() {
  const navigate = useNavigate();
  const [data, setData] = useState<PrescriptionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ─── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    getAllPrescriptions()
      .then((res) => setData(res.data.data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load."),
      )
      .finally(() => setLoading(false));
  }, []);

const columns = useMemo<MRT_ColumnDef<PrescriptionListItem>[]>(
  () => [
    {
      accessorKey: "patient_name",
      header: "Patient",
    },
    {
      accessorKey: "doctor_name",
      header: "Doctor",
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "drug_count",
      header: "Drugs",
    },
    {
      accessorKey: "severity",
      header: "AI Status",
      Cell: ({ row }) => {
        const { ai_checked, severity } = row.original;

        if (ai_checked === "skipped") {
          return <span>Single Drug</span>;
        }

        if (ai_checked === "error") {
          return <span>Check Failed</span>;
        }

        return (
          <SeverityBadge
            severity={severity as SeverityLevel}
          />
        );
      },
    },
  ],
  []
);

  const tableConfig = {
    data,
    columns,
    loading,
    onRowClick: (row: PrescriptionListItem) =>
      navigate(`/prescriptions/${row.id}`),

    topToolbar: (
      <CommonButton label="+ New Prescription" onClick={() => navigate("/new")} />
    ),

    emptyState: <div>No prescriptions found</div>,
  };

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        <div
          style={{
            background: "#FEE2E2",
            color: "#991B1B",
            padding: 16,
            borderRadius: 8,
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <MantineProvider>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 24,
            color: "#111827",
          }}
        >
          Prescriptions
        </h1>
        <CommonTable {...tableConfig} />
      </div>
    </MantineProvider>
  );
}

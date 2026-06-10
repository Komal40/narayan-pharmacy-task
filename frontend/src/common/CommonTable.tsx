import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { MantineProvider } from "@mantine/core";

export interface CommonTableProps<T> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  topToolbar?: React.ReactNode;
  emptyState?: React.ReactNode;
}

export default function CommonTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowClick,
  topToolbar,
  emptyState,
}: CommonTableProps<T>) {
  const table = useMantineReactTable({
    columns,
    data,
    state: { isLoading: loading },

    enableColumnActions: false,
    enableColumnFilters: true,
    enablePagination: true,
    enableSorting: true,
    enableGlobalFilter: true,

    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => onRowClick?.(row.original),
      style: {
        cursor: onRowClick ? "pointer" : "default",
      },
    }),
   mantineTableContainerProps: {
  style: {
    overflowX: "auto",
    scrollbarWidth: "thin",
  },
},

    renderTopToolbarCustomActions: () => topToolbar,

    renderEmptyRowsFallback: () => emptyState || <div>No Data Available</div>,
  });

  return (
    <MantineProvider>
      <MantineReactTable table={table} />
    </MantineProvider>
  );
}

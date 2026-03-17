import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  MoreHorizontal,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Filter,
} from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onSearch?: (query: string) => void;
  loading?: boolean;
  searchable?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  title,
  subtitle,
  searchPlaceholder = "Search...",
  emptyMessage = "No data available",
  onSearch,
  loading = false,
  searchable = true,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter((row) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return columns.some((col) => {
      const value = (row as Record<string, unknown>)[col.key];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(query);
    });
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = (a as Record<string, unknown>)[sortColumn];
    const bVal = (b as Record<string, unknown>)[sortColumn];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const comparison = String(aVal).localeCompare(String(bVal), undefined, {
      numeric: true,
      sensitivity: 'base',
    });

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column: Column<T>) => {
    if (column.key === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column.key);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: Column<T> }) => {
    if (!column.sortable || sortColumn !== column.key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 hover:opacity-100" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const renderCell = (row: T, column: Column<T>) => {
    if (column.render) {
      return column.render(row);
    }
    return (row as Record<string, unknown>)[column.key] as React.ReactNode;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      {(title || subtitle || searchable) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          {searchable && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
                className="pl-9 pr-4 py-2 w-full rounded-md border border-input bg-background ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground ${column.sortable ? 'cursor-pointer hover:bg-muted' : ''
                      }`}
                    onClick={() => column.sortable && handleSort(column)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable && <SortIcon column={column} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-muted/30 rounded-full p-3">
                        <Filter className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p>{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-sm ${column.className || ''}`}
                      >
                        {renderCell(row, column)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && sortedData.length > 10 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(sortedData.length, 10)}</span> of {sortedData.length} results
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DataTableActions({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ActionMenuItem({ onClick, children, destructive = false }: { onClick: () => void; children: React.ReactNode; destructive?: boolean }) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className={destructive ? 'text-destructive focus:text-destructive' : ''}
    >
      {children}
    </DropdownMenuItem>
  );
}

export function ActionMenuSeparator() {
  return <DropdownMenuSeparator />;
}

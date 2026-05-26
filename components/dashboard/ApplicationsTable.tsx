"use client"

import { useState } from "react"
import { ExternalLink, Edit3, Trash2, MapPin, DollarSign, Briefcase, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  createColumnHelper,
} from "@tanstack/react-table"

interface JobApplication {
  id: string
  company: string
  role: string
  location: string | null
  jobUrl: string | null
  salary: string | null
  status: "SAVED" | "APPLIED" | "INTERVIEW" | "REJECTED" | "OFFER"
  notes: string | null
  createdAt: string
}

interface ApplicationsTableProps {
  applications: JobApplication[]
  onStatusChange: (id: string, newStatus: JobApplication["status"]) => void
  onEdit: (app: JobApplication) => void
  onDelete: (id: string) => void
}

const STATUS_COLORS: Record<JobApplication["status"], { bg: string; text: string; border: string }> = {
  SAVED: { bg: "bg-slate-500/10", text: "text-slate-300", border: "border-slate-500/20" },
  APPLIED: { bg: "bg-indigo-500/10", text: "text-indigo-300", border: "border-indigo-500/20" },
  INTERVIEW: { bg: "bg-amber-500/10", text: "text-amber-350", border: "border-amber-500/20" },
  REJECTED: { bg: "bg-rose-500/10", text: "text-rose-300", border: "border-rose-500/20" },
  OFFER: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/20" },
}

export default function ApplicationsTable({
  applications,
  onStatusChange,
  onEdit,
  onDelete,
}: ApplicationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  
  const columnHelper = createColumnHelper<JobApplication>()
  
  const columns = [
    columnHelper.accessor("company", {
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer w-full text-left font-bold uppercase tracking-wider">
          Company & Role <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors duration-200">
              {info.getValue()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{info.row.original.role}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("location", {
      header: "Location",
      cell: (info) => {
        const loc = info.getValue();
        return loc ? (
          <div className="flex items-center gap-1.5 text-slate-300 text-sm">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>{loc}</span>
          </div>
        ) : (
          <span className="text-slate-600">—</span>
        )
      },
    }),
    columnHelper.accessor("salary", {
      header: "Salary",
      cell: (info) => {
        const sal = info.getValue();
        return sal ? (
          <div className="flex items-center gap-1.5 text-slate-350 text-sm font-medium">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <span>{sal}</span>
          </div>
        ) : (
          <span className="text-slate-600">—</span>
        )
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const app = info.row.original;
        const colors = STATUS_COLORS[app.status]
        return (
          <div className="relative inline-block">
            <select
              value={app.status}
              onChange={(e) => onStatusChange(app.id, e.target.value as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border} focus:outline-none cursor-pointer appearance-none pr-7`}
            >
              <option value="SAVED">Saved</option>
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEW">Interview</option>
              <option value="REJECTED">Rejected</option>
              <option value="OFFER">Offer</option>
            </select>
            <span className="absolute inset-y-0 right-2 flex items-center pr-1 pointer-events-none text-slate-400 text-[10px]">
              ▼
            </span>
          </div>
        )
      }
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const app = info.row.original;
        return (
          <div className="flex justify-end items-center gap-2">
            {app.jobUrl && (
              <a
                href={app.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 transition-all active:scale-95"
                title="Open job link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => onEdit(app)}
              className="p-2 text-indigo-400 hover:text-indigo-300 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 transition-all active:scale-95 cursor-pointer"
              title="Edit application"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(app.id)}
              className="p-2 text-rose-400 hover:text-rose-300 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 transition-all active:scale-95 cursor-pointer"
              title="Delete application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: applications,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      }
    }
  })

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse text-left">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-slate-850 bg-slate-950/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-4" style={{ width: header.getSize() !== 150 ? header.getSize() : 'auto' }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-850/50">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-slate-800/20 transition-all duration-150 group">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No applications match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-850 bg-slate-950/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 cursor-pointer"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-medium px-2">
              Page <span className="text-white">{table.getState().pagination.pageIndex + 1}</span> of{" "}
              <span className="text-white">{table.getPageCount()}</span>
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 cursor-pointer"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Show</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none cursor-pointer"
            >
              {[5, 10, 20, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

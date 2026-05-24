"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core"
import { useDroppable, useDraggable } from "@dnd-kit/core"
import {
  MapPin,
  DollarSign,
  Edit3,
  Trash2,
  ExternalLink,
  GripVertical,
} from "lucide-react"

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

interface KanbanBoardProps {
  applications: JobApplication[]
  onStatusChange: (id: string, newStatus: JobApplication["status"]) => void
  onEdit: (app: JobApplication) => void
  onDelete: (id: string) => void
}

const STATUS_KEYS: Array<JobApplication["status"]> = ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]

const STATUS_LABELS: Record<JobApplication["status"], string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
}

const STATUS_COLORS: Record<JobApplication["status"], { bg: string; text: string; border: string }> = {
  SAVED: {
    bg: "bg-slate-500/10",
    text: "text-slate-300",
    border: "border-slate-500/20",
  },
  APPLIED: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-300",
    border: "border-indigo-500/20",
  },
  INTERVIEW: {
    bg: "bg-amber-500/10",
    text: "text-amber-350",
    border: "border-amber-500/20",
  },
  REJECTED: {
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    border: "border-rose-500/20",
  },
  OFFER: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-350",
    border: "border-emerald-500/20",
  },
}

export default function KanbanBoard({
  applications,
  onStatusChange,
  onEdit,
  onDelete,
}: KanbanBoardProps) {
  const [mounted, setMounted] = useState(false)

  // Prevent SSR/CSR hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  // Configure pointer sensor with a 5px activation distance to let simple clicks pass through cleanly
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {STATUS_KEYS.map((status) => (
          <div key={status} className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 h-[400px] animate-pulse" />
        ))}
      </div>
    )
  }

  // Handle Drag Ending Event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const applicationId = active.id as string
    const newStatus = over.id as JobApplication["status"]

    // Find current application
    const app = applications.find((a) => a.id === applicationId)
    if (!app) return

    // If status changed, trigger PATCH request
    if (app.status !== newStatus) {
      onStatusChange(applicationId, newStatus)
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {STATUS_KEYS.map((status) => {
          const colors = STATUS_COLORS[status]
          const columnApps = applications.filter((app) => app.status === status)

          return (
            <DroppableColumn
              key={status}
              id={status}
              title={STATUS_LABELS[status]}
              count={columnApps.length}
              colors={colors}
            >
              <div className="space-y-3 flex-1 overflow-y-auto min-h-[400px] pb-6">
                {columnApps.map((app) => (
                  <DraggableCard
                    key={app.id}
                    app={app}
                    colors={STATUS_COLORS[app.status]}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))}
                {columnApps.length === 0 && (
                  <div className="flex flex-col items-center justify-center border border-dashed border-slate-850/60 rounded-xl py-12 text-slate-600 text-xs">
                    No applications
                  </div>
                )}
              </div>
            </DroppableColumn>
          )
        })}
      </div>
    </DndContext>
  )
}

/* ================= DROPPABLE COLUMN ================= */
interface DroppableColumnProps {
  id: string
  title: string
  count: number
  colors: { bg: string; text: string; border: string }
  children: React.ReactNode
}

function DroppableColumn({ id, title, count, colors, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-900/40 backdrop-blur-xl border ${
        isOver ? "border-indigo-500 ring-2 ring-indigo-500/10 shadow-indigo-500/5 bg-slate-900/60" : "border-slate-850/80"
      } rounded-2xl p-4 flex flex-col min-h-[480px] transition-all duration-200`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-850 mb-4">
        <h3 className="text-sm font-bold text-slate-200 tracking-wide">{title}</h3>
        <span className={`px-2 py-0.5 text-xs font-black rounded-lg ${colors.bg} ${colors.text} border ${colors.border}`}>
          {count}
        </span>
      </div>

      {children}
    </div>
  )
}

/* ================= DRAGGABLE CARD ================= */
interface DraggableCardProps {
  app: JobApplication
  colors: { bg: string; text: string; border: string }
  onEdit: (app: JobApplication) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, newStatus: JobApplication["status"]) => void
}

function DraggableCard({ app, colors, onEdit, onDelete, onStatusChange }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
  })

  // Apply translate transform during active drag
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-slate-950/60 border ${
        isDragging ? "border-indigo-500 shadow-indigo-500/10 scale-95" : "border-slate-850 hover:border-slate-700/60"
      } rounded-xl transition-all duration-200 shadow-md flex flex-col justify-between group relative`}
    >
      <div>
        {/* Card Header & Drag Handle */}
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <span className="font-bold text-slate-100 text-sm leading-tight group-hover:text-indigo-400 transition-colors">
            {app.company}
          </span>
          <div className="flex items-center gap-1.5">
            {app.jobUrl && (
              <a
                href={app.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-slate-350 transition-colors"
                title="View Posting"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {/* Visual Drag Handle icon where listeners are bound */}
            <div
              {...listeners}
              {...attributes}
              className="text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors"
              title="Drag Card"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium block mb-3">{app.role}</span>

        {/* Location & Salary Indicators */}
        <div className="space-y-1.5">
          {app.location && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-650" />
              <span className="truncate">{app.location}</span>
            </div>
          )}
          {app.salary && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <DollarSign className="w-3.5 h-3.5 text-slate-650" />
              <span>{app.salary}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card bottom actions */}
      <div className="mt-4 pt-3 border-t border-slate-850/50 flex items-center justify-between gap-2">
        <select
          value={app.status}
          onChange={(e) => onStatusChange(app.id, e.target.value as any)}
          className={`px-2 py-1 rounded text-[10px] font-bold ${colors.bg} ${colors.text} border ${colors.border} focus:outline-none cursor-pointer`}
        >
          <option value="SAVED">Saved</option>
          <option value="APPLIED">Applied</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFER">Offer</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(app)}
            className="text-indigo-400 hover:text-indigo-300 transition-colors p-1 bg-slate-900/60 hover:bg-slate-800 rounded border border-slate-850 cursor-pointer"
            title="Edit"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(app.id)}
            className="text-rose-400 hover:text-rose-300 transition-colors p-1 bg-slate-900/60 hover:bg-slate-800 rounded border border-slate-850 cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

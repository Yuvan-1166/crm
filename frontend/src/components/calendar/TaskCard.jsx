import { useState } from "react";
import { TASK_TYPES, PRIORITY_COLORS, STATUS_COLORS } from "./constants";
import {
  Clock,
  CheckCircle,
  X,
  Video,
  PhoneOff,
  TimerOff,
  Loader2,
} from "lucide-react";

// Task types that send appointment emails and track responses
const APPOINTMENT_TYPES = new Set(["CALL", "MEETING", "DEMO"]);

// Task Card Component
const TaskCard = ({ task, onToggleComplete, onEdit, onDelete, onResolveOverdue, isAdmin = false }) => {
  const config = TASK_TYPES[task.task_type] || TASK_TYPES.OTHER;
  const Icon = config.icon;
  const isCompleted = task.status === "COMPLETED";
  const isOverdue = task.status === "OVERDUE";
  const [resolving, setResolving] = useState(null); // tracks which resolution is in progress
  
  // Read appointment_status directly from task object (already in t.* from SQL)
  // No extra API call needed — eliminates N+1 problem
  const appointmentStatus = APPOINTMENT_TYPES.has(task.task_type) && task.contact_id
    ? task.appointment_status
    : null;

  const checkboxHoverColor = isAdmin ? "hover:border-orange-500" : "hover:border-sky-500";

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleResolve = async (resolution) => {
    if (!onResolveOverdue || resolving) return;
    setResolving(resolution);
    try {
      await onResolveOverdue(task.task_id, resolution);
    } finally {
      setResolving(null);
    }
  };

  return (
    <div
      className={`
        group p-3 border-l-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors
        ${STATUS_COLORS[task.status]}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox — hidden for overdue tasks (use resolution buttons instead) */}
        {!isOverdue && (
          <button
            onClick={() => onToggleComplete(task)}
            className={`
              mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
              ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : `border-gray-300 ${checkboxHoverColor}`}
            `}
          >
            {isCompleted && <CheckCircle className="w-3 h-3" />}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-4 h-4 text-${config.color}-500`} />
            <span
              className={`font-medium text-sm ${isCompleted ? "line-through text-gray-400" : "text-gray-800"}`}
            >
              {task.title}
            </span>
            {isOverdue && (
              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                Overdue
              </span>
            )}
            {appointmentStatus && appointmentStatus !== "PENDING" && (
              <span 
                className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  appointmentStatus === "ACCEPTED" 
                    ? "bg-emerald-100 text-emerald-700" 
                    : appointmentStatus === "RESCHEDULE_REQUESTED"
                    ? "bg-amber-100 text-amber-700"
                    : appointmentStatus === "CANCELLED"
                    ? "bg-red-100 text-red-600"
                    : ""
                }`}
              >
                {appointmentStatus === "ACCEPTED" 
                  ? "✓ Accepted" 
                  : appointmentStatus === "RESCHEDULE_REQUESTED"
                  ? "↻ Reschedule" 
                  : "✕ Cancelled"}
              </span>
            )}
            {appointmentStatus === "PENDING" && (
              <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-50 text-blue-600">
                ◷ Pending
              </span>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {task.due_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(task.due_time)}
              </span>
            )}
            {task.google_meet_link && (
              <a
                href={task.google_meet_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                title="Join Google Meet"
              >
                <Video className="w-3 h-3" />
                Meet
              </a>
            )}
            {task.contact_name && (
              <span className="truncate max-w-[120px]">
                {task.contact_name}
              </span>
            )}
            <span className={`px-1.5 py-0.5 rounded ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
          </div>

          {/* Overdue Resolution Actions */}
          {isOverdue && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => handleResolve("COMPLETED")}
                disabled={!!resolving}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                title="Mark as completed — contact was reached"
              >
                {resolving === "COMPLETED" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                Completed
              </button>
              <button
                onClick={() => handleResolve("NOT_CONNECTED")}
                disabled={!!resolving}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                title="Not connected — couldn't reach contact"
              >
                {resolving === "NOT_CONNECTED" ? <Loader2 className="w-3 h-3 animate-spin" /> : <PhoneOff className="w-3 h-3" />}
                Not Connected
              </button>
              <button
                onClick={() => handleResolve("BAD_TIMING")}
                disabled={!!resolving}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition-colors disabled:opacity-50"
                title="Bad timing — contact was busy"
              >
                {resolving === "BAD_TIMING" ? <Loader2 className="w-3 h-3 animate-spin" /> : <TimerOff className="w-3 h-3" />}
                Bad Timing
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1 hover:bg-gray-200 rounded text-gray-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.task_id)}
            className="p-1 hover:bg-red-100 rounded text-gray-500 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default TaskCard;
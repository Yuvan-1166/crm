import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Phone,
  Mail,
  Users,
  Target,
  Bell,
  CheckCircle,
  AlertCircle,
  X,
  Filter,
  Zap,
  CalendarDays,
  ListTodo,
  RefreshCw,
} from "lucide-react";
import {
  getCalendarTasks,
  getTodaysTasks,
  getWeeksTasks,
  getOverdueTasks,
  getTaskStats,
  createTask,
  updateTask,
  deleteTask,
} from "../../services/taskService";
import { getContacts } from "../../services/contactService";

// Task type configuration
const TASK_TYPES = {
  FOLLOW_UP: { icon: Target, color: "sky", label: "Follow-up" },
  CALL: { icon: Phone, color: "green", label: "Call" },
  MEETING: { icon: Users, color: "purple", label: "Meeting" },
  EMAIL: { icon: Mail, color: "blue", label: "Email" },
  DEMO: { icon: Zap, color: "orange", label: "Demo" },
  DEADLINE: { icon: AlertCircle, color: "red", label: "Deadline" },
  REMINDER: { icon: Bell, color: "amber", label: "Reminder" },
  OTHER: { icon: CalendarIcon, color: "gray", label: "Other" },
};

const PRIORITY_COLORS = {
  LOW: "bg-gray-100 text-gray-600 border-gray-200",
  MEDIUM: "bg-blue-100 text-blue-600 border-blue-200",
  HIGH: "bg-orange-100 text-orange-600 border-orange-200",
  URGENT: "bg-red-100 text-red-600 border-red-200",
};

const STATUS_COLORS = {
  PENDING: "border-l-amber-400",
  IN_PROGRESS: "border-l-blue-400",
  COMPLETED: "border-l-emerald-400 opacity-60",
  CANCELLED: "border-l-gray-300 opacity-40",
  OVERDUE: "border-l-red-500",
};

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // 'month', 'week', 'today'
  const [focusMode, setFocusMode] = useState(null); // null, 'today', 'week'
  const [tasks, setTasks] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [filterType, setFilterType] = useState("ALL");

  // Format date to YYYY-MM-DD (local timezone) - defined early for use in fetchData
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range for current view
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const [calendarTasks, today, overdue, taskStats, contactList] = await Promise.all([
        getCalendarTasks(formatDate(start), formatDate(end)),
        getTodaysTasks(),
        getOverdueTasks(),
        getTaskStats(),
        getContacts({}).catch(() => []),
      ]);

      setTasks(calendarTasks);
      setTodaysTasks(today);
      setOverdueTasks(overdue);
      setStats(taskStats);
      setContacts(Array.isArray(contactList) ? contactList : []);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  // Format time to HH:MM
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return tasks.filter((task) => {
        if (!task.due_date) return false;

        const taskDate = new Date(task.due_date);
        return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
        );
    });
  };

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
    setFocusMode("today");
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Handle task completion toggle
  const handleToggleComplete = async (task) => {
    try {
      const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
      await updateTask(task.task_id, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  // Handle task delete
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      fetchData();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // Get display tasks based on focus mode
  const displayTasks = useMemo(() => {
    let filtered = [];
    
    if (focusMode === "today") {
      filtered = todaysTasks;
    } else if (focusMode === "week") {
      const today = new Date();
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + 7);
      filtered = tasks.filter((task) => {
        const taskDate = new Date(task.due_date);
        return taskDate >= today && taskDate <= weekEnd;
      });
    } else {
      filtered = getTasksForDate(selectedDate);
    }

    if (filterType !== "ALL") {
      filtered = filtered.filter((task) => task.task_type === filterType);
    }

    return filtered.sort((a, b) => {
      if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
      if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
      if (a.due_time && b.due_time) return a.due_time.localeCompare(b.due_time);
      return 0;
    });
  }, [focusMode, todaysTasks, tasks, selectedDate, filterType]);

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-gray-500">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
          <p className="text-gray-500 mt-1">Manage your tasks, calls, and follow-ups</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Focus Mode Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFocusMode(null)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                focusMode === null ? "bg-white text-sky-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                focusMode === "today" ? "bg-white text-sky-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFocusMode("week")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                focusMode === "week" ? "bg-white text-sky-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              This Week
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Today"
            value={stats.today_pending || 0}
            icon={<CalendarIcon className="w-5 h-5" />}
            color="sky"
          />
          <StatCard
            label="This Week"
            value={stats.this_week || 0}
            icon={<ListTodo className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="Overdue"
            value={stats.overdue || 0}
            icon={<AlertCircle className="w-5 h-5" />}
            color={stats.overdue > 0 ? "red" : "gray"}
            urgent={stats.overdue > 0}
          />
          <StatCard
            label="Completed"
            value={stats.completed || 0}
            icon={<CheckCircle className="w-5 h-5" />}
            color="emerald"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">{monthName}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedDate(new Date());
                }}
                className="px-3 py-1.5 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayTasks = getTasksForDate(day.date);
              const hasOverdue = dayTasks.some((t) => t.status === "OVERDUE");
              const hasPending = dayTasks.some((t) => t.status === "PENDING" || t.status === "IN_PROGRESS");
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setFocusMode(null);
                  }}
                  className={`
                    relative p-2 min-h-[70px] rounded-lg text-left transition-all
                    ${day.isCurrentMonth ? "bg-white" : "bg-gray-50"}
                    ${isSelected(day.date) ? "ring-2 ring-sky-500 bg-sky-50" : "hover:bg-gray-50"}
                    ${isToday(day.date) ? "bg-sky-50" : ""}
                  `}
                >
                  <span
                    className={`
                      text-sm font-medium
                      ${!day.isCurrentMonth ? "text-gray-400" : "text-gray-700"}
                      ${isToday(day.date) ? "text-sky-600 font-bold" : ""}
                    `}
                  >
                    {day.date.getDate()}
                  </span>
                  
                  {/* Task Indicators */}
                  {dayTasks.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayTasks.slice(0, 2).map((task) => {
                        const config = TASK_TYPES[task.task_type] || TASK_TYPES.OTHER;
                        return (
                          <div
                            key={task.task_id}
                            className={`
                              text-xs truncate px-1 py-0.5 rounded
                              ${task.status === "COMPLETED" ? "line-through text-gray-400 bg-gray-100" : ""}
                              ${task.status === "OVERDUE" ? "bg-red-100 text-red-600" : `bg-${config.color}-100 text-${config.color}-600`}
                            `}
                          >
                            {task.title}
                          </div>
                        );
                      })}
                      {dayTasks.length > 2 && (
                        <span className="text-xs text-gray-400">+{dayTasks.length - 2} more</span>
                      )}
                    </div>
                  )}

                  {/* Status Dots */}
                  <div className="absolute bottom-1 right-1 flex gap-0.5">
                    {hasOverdue && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                    {hasPending && <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Task List Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
          {/* Panel Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {focusMode === "today"
                ? "Today's Tasks"
                : focusMode === "week"
                ? "This Week"
                : selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </h3>
            
            {/* Filter Dropdown */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Types</option>
              {Object.entries(TASK_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Overdue Warning */}
          {overdueTasks.length > 0 && focusMode !== "today" && focusMode !== "week" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {displayTasks.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No tasks scheduled</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 text-sm text-sky-600 hover:text-sky-700"
                >
                  + Add a task
                </button>
              </div>
            ) : (
              displayTasks.map((task) => (
                <TaskCard
                  key={task.task_id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      {(showAddModal || editingTask) && (
        <TaskModal
          isOpen={showAddModal || !!editingTask}
          task={editingTask}
          contacts={contacts}
          selectedDate={selectedDate}
          onClose={() => {
            setShowAddModal(false);
            setEditingTask(null);
          }}
          onSave={async (taskData) => {
            try {
              if (editingTask) {
                await updateTask(editingTask.task_id, taskData);
              } else {
                await createTask(taskData);
              }
              fetchData();
              setShowAddModal(false);
              setEditingTask(null);
            } catch (error) {
              console.error("Failed to save task:", error);
            }
          }}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color, urgent }) {
  const colorClasses = {
    sky: "bg-sky-50 text-sky-600 border-sky-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    red: "bg-red-50 text-red-600 border-red-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colorClasses[color]} ${urgent ? "animate-pulse" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-70">{label}</p>
        </div>
        <div className={`p-2 rounded-lg ${color === "sky" ? "bg-sky-100" : color === "blue" ? "bg-blue-100" : color === "emerald" ? "bg-emerald-100" : color === "red" ? "bg-red-100" : "bg-gray-100"}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onToggleComplete, onEdit, onDelete }) {
  const config = TASK_TYPES[task.task_type] || TASK_TYPES.OTHER;
  const Icon = config.icon;
  const isCompleted = task.status === "COMPLETED";
  const isOverdue = task.status === "OVERDUE";

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div
      className={`
        group p-3 border-l-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors
        ${STATUS_COLORS[task.status]}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task)}
          className={`
            mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
            ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 hover:border-sky-500"}
          `}
        >
          {isCompleted && <CheckCircle className="w-3 h-3" />}
        </button>

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
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {task.due_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(task.due_time)}
              </span>
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

// Task Modal Component
function TaskModal({ isOpen, task, contacts, selectedDate, onClose, onSave }) {
  // Helper to format date in local timezone
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    task_type: task?.task_type || "FOLLOW_UP",
    priority: task?.priority || "MEDIUM",
    due_date: task?.due_date?.split("T")[0] || formatLocalDate(selectedDate),
    due_time: task?.due_time?.substring(0, 5) || "",
    duration_minutes: task?.duration_minutes || 30,
    contact_id: task?.contact_id || "",
    is_all_day: task?.is_all_day || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.due_date) return;
    
    setSaving(true);
    await onSave({
      ...formData,
      contact_id: formData.contact_id || null,
      due_time: formData.is_all_day ? null : formData.due_time || null,
    });
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {task ? "Edit Task" : "Add New Task"}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Task title"
              required
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.task_type}
                onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {Object.entries(TASK_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={formData.due_time}
                onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                disabled={formData.is_all_day}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_all_day}
              onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked })}
              className="w-4 h-4 text-sky-500 rounded focus:ring-sky-500"
            />
            <span className="text-sm text-gray-700">All day event</span>
          </label>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Contact</label>
            <select
              value={formData.contact_id}
              onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">No contact</option>
              {contacts.map((contact) => (
                <option key={contact.contact_id} value={contact.contact_id}>
                  {contact.name} - {contact.email}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              placeholder="Add notes or details..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.title}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : task ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

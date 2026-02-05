// Stat Card Component
const StatCard = ({ label, value, icon, color, urgent }) => {
  const colorClasses = {
    sky: "bg-sky-50 text-sky-600 border-sky-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    red: "bg-red-50 text-red-600 border-red-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
  };

  const iconBgClasses = {
    sky: "bg-sky-100",
    blue: "bg-blue-100",
    emerald: "bg-emerald-100",
    red: "bg-red-100",
    gray: "bg-gray-100",
    orange: "bg-orange-100",
    amber: "bg-amber-100",
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colorClasses[color]} ${urgent ? "animate-pulse" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-70">{label}</p>
        </div>
        <div className={`p-2 rounded-lg ${iconBgClasses[color] || "bg-gray-100"}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
export default StatCard;
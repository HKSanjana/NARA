import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  color: string;
}

export default function StatsCard({ icon: Icon, value, label, color }: StatsCardProps) {
  return (
    <div className="text-center">
      <div className="bg-nara-light p-6 rounded-xl mb-4">
        <Icon className={`${color} w-10 h-10 mx-auto`} />
      </div>
      <h3 className="text-3xl font-bold text-nara-navy">{value}</h3>
      <p className="text-gray-600 font-medium">{label}</p>
    </div>
  );
}

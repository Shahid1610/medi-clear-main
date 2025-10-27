interface SeverityBadgeProps {
  level: 'NORMAL' | 'MODERATE' | 'URGENT' | 'MONITOR' | 'LOW' | 'HIGH';
  label?: string;
}

export default function SeverityBadge({ level, label }: SeverityBadgeProps) {
  const styles = {
    NORMAL: 'bg-green-500/20 text-green-400 border-green-500/30',
    LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
    MODERATE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    MONITOR: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    URGENT: 'bg-red-500/20 text-red-400 border-red-500/30',
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[level]}`}>
      {label || level}
    </span>
  );
}

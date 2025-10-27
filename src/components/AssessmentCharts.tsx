import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { SymptomAssessment } from "../types";

const COLORS = [
  "#06b6d4",
  "#3b82f6",
  "#f59e42",
  "#ef4444",
  "#10b981",
  "#eab308",
  "#f97316",
  "#a21caf",
];

export function ConditionsPieChart({
  assessment,
}: {
  assessment: SymptomAssessment;
}) {
  const data = assessment.possible_conditions.map((c) => ({
    name: c.condition,
    value: c.probability,
  }));
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UrgencyBarChart({
  assessment,
}: {
  assessment: SymptomAssessment;
}) {
  const data = [
    {
      name: assessment.urgency_level,
      score: assessment.urgency_score,
    },
  ];
  return (
    <div className="w-full h-48">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="score" fill="#06b6d4" barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

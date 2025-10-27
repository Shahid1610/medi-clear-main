export interface SymptomRequest {
  symptoms: string;
  age: number;
  gender: string;
  duration: string;
  severity: number;
}

export interface PossibleCondition {
  condition: string;
  probability: number;
  description: string;
}

export interface SymptomAssessment {
  assessment_id: string;
  urgency_level: 'NORMAL' | 'MODERATE' | 'URGENT';
  urgency_score: number;
  possible_conditions: PossibleCondition[];
  recommended_tests: string[];
  action_items: string[];
  warning_signs: string[];
  when_to_seek_care: string;
}

export interface MedicalRecord {
  record_id: string;
  record_type: string;
  report_date: string;
  lab_name: string;
  status: 'NORMAL' | 'MONITOR' | 'URGENT';
  created_at: string;
}

export interface ParsedTestData {
  [testName: string]: {
    value: number;
    unit: string;
    normal_range: [number, number];
    status: 'NORMAL' | 'HIGH' | 'LOW';
  };
}

export interface RecordDetails {
  record_id: string;
  record_type: string;
  report_date: string;
  lab_name: string;
  extracted_text: string;
  parsed_data: ParsedTestData;
  analysis: {
    simple_explanation: string;
    key_findings: string[];
    risk_score: number;
    recommendations: string[];
  };
}

export interface KeyFinding {
  test_name: string;
  your_value: string;
  normal_range: string;
  meaning: string;
  severity: 'NORMAL' | 'MONITOR' | 'URGENT';
  action: string;
}

export interface ReportExplanation {
  simple_summary: string;
  key_findings: KeyFinding[];
  overall_health_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH';
  positive_findings: string[];
  concerns: string[];
  next_steps: string[];
}

export interface HealthTrend {
  test_name: string;
  historical_values: Array<{ date: string; value: number }>;
  trend_direction: 'IMPROVING' | 'WORSENING' | 'STABLE';
  velocity: number;
  forecast: number;
  chart_data: any[];
}

export interface ChatMessage {
  timestamp: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  answer: string;
  referenced_records: string[];
  confidence_score: number;
  follow_up_suggestions: string[];
  session_id: string;
}

export interface DashboardStats {
  total_records: number;
  latest_health_score: number;
  urgent_findings: number;
  reports_by_type: { [key: string]: number };
  recent_trends: Array<{
    metric: string;
    trend: 'up' | 'down' | 'stable';
    change_percent: number;
  }>;
}

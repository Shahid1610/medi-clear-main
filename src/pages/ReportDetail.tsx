import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, AlertCircle } from 'lucide-react';
import { getRecordDetails, explainReport, getHealthTrends } from '../services/api';
import type { RecordDetails, ReportExplanation, HealthTrend } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import SeverityBadge from '../components/SeverityBadge';
import Alert from '../components/Alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportDetail() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<RecordDetails | null>(null);
  const [explanation, setExplanation] = useState<ReportExplanation | null>(null);
  const [trends, setTrends] = useState<HealthTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'explanation' | 'trends'>('overview');

  useEffect(() => {
    fetchRecordData();
  }, [recordId]);

  const fetchRecordData = async () => {
    if (!recordId) return;

    try {
      setLoading(true);
      const [recordData, explanationData, trendsData] = await Promise.all([
        getRecordDetails(recordId),
        explainReport(recordId).catch(() => null),
        getHealthTrends(recordId).catch(() => ({ test_trends: [] })),
      ]);

      setRecord(recordData);
      setExplanation(explanationData?.explanation || null);
      setTrends(trendsData.test_trends);
    } catch (err) {
      setError('Failed to load report details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert type="error" message={error || 'Record not found'} />
          <button
            onClick={() => navigate('/reports')}
            className="mt-4 text-cyan-400 hover:text-cyan-300 font-medium"
          >
            ← Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center text-gray-400 hover:text-cyan-400 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Reports
        </button>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{record.record_type}</h1>
                <p className="text-cyan-100">
                  {record.lab_name} • {new Date(record.report_date).toLocaleDateString()}
                </p>
              </div>
              {explanation && <SeverityBadge level={explanation.risk_level} />}
            </div>
          </div>

          <div className="border-b border-cyan-500/20">
            <div className="flex space-x-1 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'explanation', label: 'Explanation' },
                { id: 'trends', label: 'Trends' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">Test Results</h3>
                  {Object.keys(record.parsed_data).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-700/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">
                              Test Name
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">
                              Your Value
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">
                              Normal Range
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {Object.entries(record.parsed_data).map(([testName, data]) => (
                            <tr key={testName} className="hover:bg-slate-700/30">
                              <td className="px-4 py-3 text-sm font-medium text-white">
                                {testName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300">
                                {data.value} {data.unit}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300">
                                {data.normal_range[0]} - {data.normal_range[1]} {data.unit}
                              </td>
                              <td className="px-4 py-3">
                                <SeverityBadge level={data.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-slate-700/30 rounded-lg p-6 text-center border border-cyan-500/20">
                      <p className="text-gray-400">No parsed data available</p>
                    </div>
                  )}
                </div>

                {record.analysis.simple_explanation && (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-cyan-400 mb-2">Summary</h4>
                    <p className="text-gray-300">{record.analysis.simple_explanation}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'explanation' && explanation && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-lg p-6 border border-cyan-500/30">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">Simple Summary</h3>
                  <p className="text-gray-200 leading-relaxed">{explanation.simple_summary}</p>
                </div>

                {explanation.overall_health_score > 0 && (
                  <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Overall Health Score</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="w-full bg-slate-600 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full ${
                              explanation.overall_health_score >= 80
                                ? 'bg-gradient-to-r from-green-500 to-green-600'
                                : explanation.overall_health_score >= 60
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                : 'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                            style={{ width: `${explanation.overall_health_score}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-3xl font-bold text-white">
                        {explanation.overall_health_score}
                      </span>
                    </div>
                  </div>
                )}

                {explanation.key_findings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">Key Findings</h3>
                    <div className="space-y-3">
                      {explanation.key_findings.map((finding, index) => (
                        <div key={index} className="border border-cyan-500/20 bg-slate-700/30 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-white">{finding.test_name}</h4>
                            <SeverityBadge level={finding.severity} />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                            <div>
                              <span className="text-gray-400">Your Value: </span>
                              <span className="font-medium text-white">{finding.your_value}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Normal: </span>
                              <span className="font-medium text-white">{finding.normal_range}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{finding.meaning}</p>
                          <p className="text-sm text-cyan-400 font-medium">{finding.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {explanation.positive_findings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">Positive Findings</h3>
                    <ul className="space-y-2">
                      {explanation.positive_findings.map((finding, index) => (
                        <li key={index} className="flex items-start text-green-400">
                          <TrendingUp className="w-5 h-5 mr-2 flex-shrink-0" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.concerns.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">Concerns</h3>
                    <ul className="space-y-2">
                      {explanation.concerns.map((concern, index) => (
                        <li key={index} className="flex items-start text-red-400">
                          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.next_steps.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-3">Next Steps</h3>
                    <ul className="space-y-2">
                      {explanation.next_steps.map((step, index) => (
                        <li key={index} className="text-yellow-300">
                          • {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-6">
                {trends.length > 0 ? (
                  trends.map((trend, index) => (
                    <div key={index} className="border border-cyan-500/20 bg-slate-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">{trend.test_name}</h3>
                        <SeverityBadge
                          level={
                            trend.trend_direction === 'IMPROVING'
                              ? 'NORMAL'
                              : trend.trend_direction === 'WORSENING'
                              ? 'URGENT'
                              : 'MODERATE'
                          }
                          label={trend.trend_direction}
                        />
                      </div>
                      {trend.historical_values.length > 1 && (
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={trend.historical_values}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1e293b',
                                border: '1px solid #06b6d4',
                                color: '#fff'
                              }} 
                            />
                            <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                      <div className="mt-4 text-sm text-gray-400">
                        <p>
                          Velocity: {trend.velocity > 0 ? '+' : ''}
                          {trend.velocity}
                        </p>
                        {trend.forecast && <p>Forecast: {trend.forecast}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-700/30 rounded-lg p-12 text-center border border-cyan-500/20">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No trend data available
                    </h3>
                    <p className="text-gray-400">Upload more reports to see health trends over time</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

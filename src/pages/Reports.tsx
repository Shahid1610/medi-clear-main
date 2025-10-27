import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Building2, TrendingUp } from 'lucide-react';
import { getMedicalRecords } from '../services/api';
import type { MedicalRecord } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import SeverityBadge from '../components/SeverityBadge';
import Alert from '../components/Alert';

export default function Reports() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [filter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await getMedicalRecords({
        limit: 50,
        offset: 0,
        record_type: filter || undefined,
      });
      setRecords(data.records);
      
      // Add demo data if no records found (only on initial load)
      if (data.records.length === 0 && filter === '' && !error) {
        setRecords([
          {
            record_id: 'demo-1',
            record_type: 'Blood Test',
            report_date: new Date().toISOString(),
            lab_name: 'Apollo Diagnostics',
            status: 'NORMAL',
            created_at: new Date().toISOString(),
          },
          {
            record_id: 'demo-2',
            record_type: 'X-Ray',
            report_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            lab_name: 'Max Healthcare',
            status: 'MONITOR',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      }
    } catch (err) {
      setError('Failed to load records. Please try again.');
      // Add demo data on error
      setRecords([
        {
          record_id: 'demo-1',
          record_type: 'Blood Test',
          report_date: new Date().toISOString(),
          lab_name: 'Apollo Diagnostics',
          status: 'NORMAL',
          created_at: new Date().toISOString(),
        },
        {
          record_id: 'demo-2',
          record_type: 'X-Ray',
          report_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lab_name: 'Max Healthcare',
          status: 'MONITOR',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const recordTypes = ['All', 'Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG', 'Other'];

  const getRecordIcon = (_type: string) => {
    return <FileText className="w-6 h-6" />;
  };

  const getRecordColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Blood Test': 'from-red-500 to-pink-500',
      'X-Ray': 'from-gray-500 to-gray-700',
      'MRI': 'from-blue-500 to-cyan-500',
      'CT Scan': 'from-green-500 to-emerald-500',
      'Ultrasound': 'from-purple-500 to-pink-500',
      'ECG': 'from-orange-500 to-red-500',
    };
    return colors[type] || 'from-gray-500 to-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            My Medical Reports
          </h1>
          <p className="text-gray-400">View and manage all your medical records</p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {recordTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type === 'All' ? '' : type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  (filter === '' && type === 'All') || filter === type
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {records.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No records found</h3>
            <p className="text-gray-400 mb-6">Upload your first medical record to get started</p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/50"
            >
              Upload Record
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <div
                key={record.record_id}
                className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:shadow-xl hover:shadow-cyan-500/20 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/reports/${record.record_id}`)}
              >
                <div className={`h-2 bg-gradient-to-r ${getRecordColor(record.record_type)} shadow-lg`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${getRecordColor(record.record_type)} text-white shadow-lg`}>
                      {getRecordIcon(record.record_type)}
                    </div>
                    <SeverityBadge level={record.status} />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-3">{record.record_type}</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(record.report_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Building2 className="w-4 h-4 mr-2" />
                      {record.lab_name}
                    </div>
                  </div>

                  <button className="mt-4 w-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 py-2 rounded-lg font-medium hover:from-cyan-600/30 hover:to-blue-700/30 transition-all flex items-center justify-center border border-cyan-500/30">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X } from 'lucide-react';
import { uploadMedicalRecord } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function UploadRecords() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    record_type: '',
    report_date: '',
    lab_name: '',
    notes: '',
  });

  const recordTypes = [
    'Blood Test',
    'X-Ray',
    'MRI',
    'CT Scan',
    'Ultrasound',
    'ECG',
    'Pathology Report',
    'Prescription',
    'Other',
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setError(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setError(null);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, JPG, and PNG files are allowed');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('record_type', formData.record_type);
      uploadFormData.append('report_date', formData.report_date);
      uploadFormData.append('lab_name', formData.lab_name);
      if (formData.notes) {
        uploadFormData.append('notes', formData.notes);
      }

      await uploadMedicalRecord(uploadFormData);
      setSuccess(true);
      setFile(null);
      setFormData({
        record_type: '',
        report_date: '',
        lab_name: '',
        notes: '',
      });
      // Navigate to reports after successful upload
      setTimeout(() => {
        navigate('/reports');
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 p-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Upload Medical Records
          </h1>
          <p className="text-gray-400 mb-8">Securely store and manage your medical reports</p>

          {success && (
            <div className="mb-6">
              <Alert
                type="success"
                message="Medical record uploaded successfully!"
                onClose={() => setSuccess(false)}
              />
            </div>
          )}

          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                  : file
                  ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                  : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center space-x-4">
                  <FileText className="w-12 h-12 text-cyan-400" />
                  <div className="text-left">
                    <p className="font-medium text-white">{file.name}</p>
                    <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-300 mb-2">
                    Drag and drop your file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">or</p>
                  <label className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/50 cursor-pointer">
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-4">Supported: PDF, JPG, PNG (Max 10MB)</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cyan-400 mb-2">
                  Record Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.record_type}
                  onChange={(e) => setFormData({ ...formData, record_type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                >
                  <option value="" className="bg-slate-800">Select Type</option>
                  {recordTypes.map((type) => (
                    <option key={type} value={type} className="bg-slate-800">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-400 mb-2">
                  Report Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.report_date}
                  onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">
                Lab/Hospital Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lab_name}
                onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
                placeholder="E.g., Apollo Diagnostics"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
                placeholder="Any additional notes about this report..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Upload Record'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

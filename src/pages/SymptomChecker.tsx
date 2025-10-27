import { useState } from 'react';
import { analyzeSymptoms } from '../services/api';
import type { SymptomAssessment } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import SeverityBadge from '../components/SeverityBadge';
import Alert from '../components/Alert';
import { AlertTriangle, CheckCircle, Sparkles, ArrowRight, ArrowLeft, HeartPulse } from 'lucide-react';

export default function SymptomChecker() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<SymptomAssessment | null>(null);

  const [formData, setFormData] = useState({
    symptoms: '',
    age: '',
    gender: '',
    duration: '',
    severity: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await analyzeSymptoms({
        symptoms: formData.symptoms,
        age: parseInt(formData.age),
        gender: formData.gender,
        duration: formData.duration,
        severity: formData.severity,
      });
      setAssessment(data);
    } catch (err) {
      setError('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setAssessment(null);
    setFormData({
      symptoms: '',
      age: '',
      gender: '',
      duration: '',
      severity: 5,
    });
  };

  if (assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Assessment Results</h2>
              <SeverityBadge level={assessment.urgency_level} />
            </div>

            <div className="mb-8">
              <div className="bg-slate-700/50 rounded-lg p-6 mb-6 border border-cyan-500/10 shadow-lg shadow-cyan-500/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-cyan-400">Urgency Score</span>
                  <span className="text-2xl font-bold text-white">{assessment.urgency_score}/100</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full shadow-lg ${
                      assessment.urgency_score > 70
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : assessment.urgency_score > 40
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                        : 'bg-gradient-to-r from-cyan-500 to-cyan-600'
                    }`}
                    style={{ width: `${assessment.urgency_score}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Possible Conditions</h3>
                <div className="space-y-3">
                  {assessment.possible_conditions.map((condition, index) => (
                    <div key={index} className="border border-cyan-500/20 bg-slate-700/30 rounded-lg p-4 hover:border-cyan-500/40 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{condition.condition}</h4>
                        <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{condition.probability}%</span>
                      </div>
                      <p className="text-sm text-gray-300">{condition.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {assessment.recommended_tests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">Recommended Tests</h3>
                  <ul className="space-y-2">
                    {assessment.recommended_tests.map((test, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <CheckCircle className="w-5 h-5 text-cyan-400 mr-2" />
                        {test}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {assessment.action_items.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">Action Items</h3>
                  <ul className="space-y-2">
                    {assessment.action_items.map((item, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <CheckCircle className="w-5 h-5 text-blue-400 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {assessment.warning_signs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    Warning Signs
                  </h3>
                  <ul className="space-y-2">
                    {assessment.warning_signs.map((sign, index) => (
                      <li key={index} className="flex items-center text-red-300">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">When to Seek Care</h3>
                <p className="text-sm text-gray-300">{assessment.when_to_seek_care}</p>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70"
            >
              Check New Symptoms
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AI Symptom Checker
              </h1>
              <p className="text-gray-400 text-sm">Powered by advanced AI for accurate health insights</p>
            </div>
          </div>
          
          <div className="relative mb-8">
            <div className="flex items-center">
              {/* Step 1 */}
              <div className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-300 ${
                    step > 1
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/50 scale-110' 
                      : step === 1
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/50 ring-4 ring-cyan-500/30 scale-110 animate-pulse-glow'
                      : 'bg-slate-700 text-gray-500 border border-slate-600'
                  }`}
                >
                  {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
                </div>
              </div>
              
              {/* Progress line between 1 and 2 */}
              <div className="flex-1 h-1.5 bg-slate-700 mx-2 relative overflow-hidden rounded-full">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    step > 1 ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-700'
                  }`}
                  style={{
                    width: step >= 2 ? '100%' : '0%',
                    transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                ></div>
              </div>
              
              {/* Step 2 */}
              <div className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-300 ${
                    step > 2
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/50 scale-110' 
                      : step === 2
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/50 ring-4 ring-cyan-500/30 scale-110 animate-pulse-glow'
                      : step === 1
                      ? 'bg-slate-700 text-gray-500 border border-slate-600'
                      : 'bg-slate-700 text-gray-500 border border-slate-600'
                  }`}
                >
                  {step > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
                </div>
              </div>
              
              {/* Progress line between 2 and 3 */}
              <div className="flex-1 h-1.5 bg-slate-700 mx-2 relative overflow-hidden rounded-full">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    step > 2 ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-700'
                  }`}
                  style={{
                    width: step >= 3 ? '100%' : '0%',
                    transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                ></div>
              </div>
              
              {/* Step 3 */}
              <div className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-300 ${
                    step === 3
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/50 ring-4 ring-cyan-500/30 scale-110 animate-pulse-glow'
                      : step > 3
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/50 scale-110'
                      : step === 2
                      ? 'bg-slate-700 text-gray-500 border border-slate-600'
                      : 'bg-slate-700 text-gray-500 border border-slate-600'
                  }`}
                >
                  3
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <label className="block text-sm font-semibold text-cyan-400">
                      Describe Your Symptoms
                    </label>
                  </div>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500 transition-all duration-200 resize-none"
                    placeholder="Describe what you're experiencing in detail...&#10;E.g., I have a persistent headache, fever around 100.4°F, and sore throat that started 2 days ago. The pain worsens when swallowing."
                    required
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Be as detailed as possible for more accurate assessment
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.symptoms.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                      <span>Age</span>
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      required
                      min="1"
                      max="120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-cyan-400 mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                      required
                    >
                      <option value="" className="bg-slate-800">Select</option>
                      <option value="male" className="bg-slate-800">Male</option>
                      <option value="female" className="bg-slate-800">Female</option>
                      <option value="other" className="bg-slate-800">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">How long have you had these symptoms?</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500 transition-all duration-200"
                    placeholder="E.g., 2 days, 1 week, 3 months"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-700 text-gray-300 py-3.5 rounded-lg font-semibold hover:bg-slate-600 transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!formData.age || !formData.gender || !formData.duration}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-4">
                    How severe are your symptoms?
                    <span className="ml-2 text-2xl font-bold text-white">{formData.severity}/10</span>
                  </label>
                  
                  {/* Interactive Health Indicator */}
                  <div className="flex flex-col items-center mb-6">
                    <div className={`text-6xl transition-all duration-300 ${
                      formData.severity <= 4 ? 'animate-pulse-glow' : formData.severity >= 8 ? 'animate-shake' : ''
                    }`}>
                      <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 mb-3 shadow-lg ${
                          formData.severity <= 3 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/50'
                            : formData.severity <= 6
                            ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-yellow-500/50'
                            : formData.severity <= 9
                            ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/50'
                            : 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/50'
                        }`}>
                          <span className="text-3xl">
                            {formData.severity <= 3 ? '😊' : 
                             formData.severity <= 6 ? '😐' : 
                             formData.severity <= 9 ? '😞' : '😰'}
                          </span>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                          formData.severity <= 3 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : formData.severity <= 6
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : formData.severity <= 9
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {formData.severity <= 3 ? 'Mild' : 
                           formData.severity <= 6 ? 'Moderate' : 
                           formData.severity <= 9 ? 'Severe' : 'Critical'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 rounded-lg border border-cyan-500/20 shadow-lg">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                      className="w-full h-4 appearance-none cursor-pointer transition-all duration-200 hover:scale-105 rounded-full"
                      style={{
                        background: formData.severity <= 3
                          ? `linear-gradient(to right, #10b981 0%, #10b981 ${(formData.severity - 1) * 11.11}%, #475569 ${(formData.severity - 1) * 11.11}%, #475569 100%)`
                          : formData.severity <= 6
                          ? `linear-gradient(to right, #eab308 0%, #eab308 ${(formData.severity - 1) * 11.11}%, #475569 ${(formData.severity - 1) * 11.11}%, #475569 100%)`
                          : formData.severity <= 9
                          ? `linear-gradient(to right, #f97316 0%, #f97316 ${(formData.severity - 1) * 11.11}%, #475569 ${(formData.severity - 1) * 11.11}%, #475569 100%)`
                          : `linear-gradient(to right, #ef4444 0%, #ef4444 ${(formData.severity - 1) * 11.11}%, #475569 ${(formData.severity - 1) * 11.11}%, #475569 100%)`,
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    />
                    <div className="flex justify-between text-xs mt-4">
                      <span className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-green-400">1-3</span>
                        <span className="text-green-300 mt-1">Mild</span>
                      </span>
                      <span className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-yellow-400">4-6</span>
                        <span className="text-yellow-300 mt-1">Moderate</span>
                      </span>
                      <span className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-orange-400">7-9</span>
                        <span className="text-orange-300 mt-1">Severe</span>
                      </span>
                      <span className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-red-400">10</span>
                        <span className="text-red-300 mt-1">Critical</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {formData.severity >= 7 && (
                  <div className={`border rounded-lg p-4 animate-fade-in transition-all duration-300 ${
                    formData.severity >= 9 
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-orange-500/10 border-orange-500/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-5 h-5 ${formData.severity >= 9 ? 'text-red-400' : 'text-orange-400'}`} />
                      <span className={`font-semibold ${formData.severity >= 9 ? 'text-red-400' : 'text-orange-400'}`}>
                        {formData.severity >= 9 ? 'Critical Severity Detected' : 'High Severity Detected'}
                      </span>
                    </div>
                    <p className={`text-sm ${formData.severity >= 9 ? 'text-red-300' : 'text-orange-300'}`}>
                      {formData.severity >= 9 
                        ? '⚠️ Consider seeking immediate medical attention for critical symptoms.'
                        : 'Consider seeking medical attention soon for severe symptoms.'}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-slate-700 text-gray-300 py-3.5 rounded-lg font-semibold hover:bg-slate-600 transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>Analyze Symptoms</span>
                        <Sparkles className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

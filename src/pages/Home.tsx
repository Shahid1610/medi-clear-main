import { Link } from 'react-router-dom';
import { Stethoscope, FileText, MessageSquare, TrendingUp } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: 'AI Symptom Checker',
      description: 'Get instant insights about your symptoms with AI-powered analysis',
      link: '/symptom-checker',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Medical Records',
      description: 'Upload and manage your medical reports in one secure place',
      link: '/upload-records',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Report Analysis',
      description: 'Understand your medical reports with simple explanations',
      link: '/reports',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Health Q&A Chat',
      description: 'Ask questions about your health and get personalized answers',
      link: '/chat',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">HealthSense AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your intelligent health companion for symptom analysis, medical record management, and personalized health insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
              <div className="p-8">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-4 flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                  Get Started →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Describe Symptoms</h4>
              <p className="text-sm text-gray-600">Share what you're experiencing</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Upload Reports</h4>
              <p className="text-sm text-gray-600">Add your medical documents</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Get Analysis</h4>
              <p className="text-sm text-gray-600">Receive AI-powered insights</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Track Progress</h4>
              <p className="text-sm text-gray-600">Monitor your health journey</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

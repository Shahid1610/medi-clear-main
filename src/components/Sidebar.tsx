import { useState } from 'react';
import { Activity, MessageSquare, Upload, FileText, Menu, X, Stethoscope } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ currentView, onViewChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsSidebarHovered] = useState(false);
  
  // Show content when hovered or not collapsed
  const showContent = !isCollapsed || isHovered;

  const navItems = [
    { id: 'symptom-checker', icon: Stethoscope, label: 'Symptom Checker' },
    { id: 'chat', icon: MessageSquare, label: 'Health Chat' },
    { id: 'upload', icon: Upload, label: 'Upload Records' },
    { id: 'reports', icon: FileText, label: 'My Reports' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-all duration-300"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 border-r border-cyan-500/20 transition-all duration-300 ease-in-out z-40 shadow-2xl ${
          isCollapsed ? 'w-20 hover:w-64' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
            <div className={`flex items-center space-x-2 overflow-hidden transition-all duration-300 ${
              showContent ? 'opacity-100' : 'opacity-0 w-0'
            }`}>
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                HealthSense
              </span>
            </div>
            <button
              onClick={() => {
                onToggleCollapse();
                setIsMobileOpen(false);
              }}
              className="p-2 rounded-lg hover:bg-slate-700 text-cyan-400 transition-all duration-300 ml-auto"
            >
              {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg shadow-cyan-500/30 border border-cyan-500/50'
                      : 'text-gray-400 hover:text-cyan-400 hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    showContent ? 'opacity-100 ml-3' : 'opacity-0 w-0 ml-0'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-cyan-500/20">
            <div className={`text-xs text-gray-500 transition-all duration-300 overflow-hidden ${
              showContent ? 'opacity-100' : 'opacity-0 h-0'
            }`}>
              <p>AI-Powered Health Platform</p>
              <p className="text-cyan-400/50">© 2024 HealthSense AI</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CustomCursor from './components/CustomCursor';
import SymptomChecker from './pages/SymptomChecker';
import UploadRecords from './pages/UploadRecords';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import HealthChat from './pages/HealthChat';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('symptom-checker');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/symptom-checker') {
      setCurrentView('symptom-checker');
    } else if (path === '/chat') {
      setCurrentView('chat');
    } else if (path === '/upload') {
      setCurrentView('upload');
    } else if (path.startsWith('/reports')) {
      setCurrentView('reports');
    }
  }, [location]);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    navigate(`/${view}`);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <>
      <CustomCursor />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
        <Sidebar 
          currentView={currentView} 
          onViewChange={handleViewChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
        
        <main className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
          <Routes>
            <Route path="/" element={<SymptomChecker />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/chat" element={<HealthChat />} />
            <Route path="/upload" element={<UploadRecords />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:recordId" element={<ReportDetail />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import CustomCursor from "./components/CustomCursor";
import SymptomChecker from "./pages/SymptomChecker";
import UploadRecords from "./pages/UploadRecords";
import Reports from "./pages/Reports";
import ReportDetail from "./pages/ReportDetail";
import HealthChat from "./pages/HealthChat";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("symptom-checker");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path === "/symptom-checker") {
      setCurrentView("symptom-checker");
    } else if (path === "/chat") {
      setCurrentView("chat");
    } else if (path === "/upload") {
      setCurrentView("upload");
    } else if (path.startsWith("/reports")) {
      setCurrentView("reports");
    }
  }, [location]);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    navigate(`/${view}`);
  };

  return (
    <>
      <CustomCursor />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex bg-dot-grid">
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          onExpandChange={setSidebarExpanded}
        />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarExpanded ? "lg:ml-64" : "lg:ml-20"
          }`}
        >
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

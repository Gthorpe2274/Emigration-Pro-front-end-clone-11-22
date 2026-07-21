import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import RelocationHub from './pages/RelocationHub';
import BestCountries from './pages/BestCountries';
import CityDetails from './pages/CityDetails';
import AboutUs from './pages/AboutUs';
import { SampleReport } from './pages/SampleReport';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AdminConfig from './pages/AdminConfig';
import WorkerDiagnostics from './pages/WorkerDiagnostics';
import RAGInterface from './pages/RAGInterface';
import RAGDashboard from './pages/RAGDashboard';
import EmailTest from './pages/EmailTest';
import JobProcessor from './pages/JobProcessor';
import SocialLogin from './pages/SocialLogin';
import PermanentRelocationHub from './pages/PermanentRelocationHub';
import CRM from './pages/CRM';
import AdminLogin from './pages/AdminLogin';
import ProtectedAdmin from './components/ProtectedAdmin';
import BlogPost from './pages/BlogPost';
import BlogAdmin from './pages/BlogAdmin';
import Blog from './pages/Blog';
import EarnAbroad from './pages/EarnAbroad';
import LivingWageBusiness from './pages/LivingWageBusiness';
import FileConverter from './pages/FileConverter';
import AdminReportGen from './pages/AdminReportGen';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/relocation-hub/:id" element={<RelocationHub />} />
        <Route path="/best-countries" element={<BestCountries />} />
        <Route path="/city/:country/:city" element={<CityDetails />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/sample-report" element={<SampleReport />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/admin/config" element={<AdminConfig />} />
        <Route path="/test-reports" element={<AdminReportGen />} />
        <Route path="/admin/diagnostics" element={<WorkerDiagnostics />} />
        <Route path="/admin/rag-dashboard" element={<RAGDashboard />} />
        <Route path="/admin/email-test" element={<EmailTest />} />
        <Route path="/admin/jobs" element={<JobProcessor />} />
        <Route path="/admin/social-login" element={<SocialLogin />} />
        <Route path="/system-login" element={<Navigate to="/admin/crm" replace />} />
        <Route path="/admin/system-login" element={<Navigate to="/admin/crm" replace />} />
        <Route path="/admin/crm" element={<CRM />} />
        <Route path="/admin/blog" element={<BlogAdmin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/access-hub" element={<PermanentRelocationHub />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/earn-abroad" element={<EarnAbroad />} />
        <Route path="/living-wage-business" element={<LivingWageBusiness />} />
        <Route path="/file-converter" element={<FileConverter />} />
      </Routes>
    </Router>
  );
}

export default App;

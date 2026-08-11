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
import DigitalSales from './pages/DigitalSales';
import MultipleOptions from './pages/MultipleOptions';
import Youtuber from './pages/Youtuber';
import Affiliate from './pages/Affiliate';
import Agency from './pages/Agency';
import FileConverter from './pages/FileConverter';
import AdminReportGen from './pages/AdminReportGen';
import CheckoutReport from './pages/CheckoutReport';
import NoIndex from './components/NoIndex';
import Glossary from './pages/Glossary';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assessment" element={<Assessment />} />
        {/* Per-customer output — noindex, see components/NoIndex.tsx */}
        <Route path="/results/:id" element={<NoIndex title="Your Results"><Results /></NoIndex>} />
        <Route path="/relocation-hub/:id" element={<NoIndex title="Relocation Hub"><RelocationHub /></NoIndex>} />
        <Route path="/best-countries" element={<BestCountries />} />
        <Route path="/city/:country/:city" element={<CityDetails />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/sample-report" element={<SampleReport />} />
        <Route path="/moving-abroad-glossary" element={<Glossary />} />
        <Route path="/checkout-report" element={<NoIndex title="Checkout"><CheckoutReport /></NoIndex>} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/admin/config" element={<NoIndex title="Admin Config"><AdminConfig /></NoIndex>} />
        <Route path="/test-reports" element={<NoIndex title="Report Generator"><AdminReportGen /></NoIndex>} />
        <Route path="/admin/diagnostics" element={<NoIndex title="Diagnostics"><WorkerDiagnostics /></NoIndex>} />
        <Route path="/admin/rag-dashboard" element={<NoIndex title="RAG Dashboard"><RAGDashboard /></NoIndex>} />
        <Route path="/admin/email-test" element={<NoIndex title="Email Test"><EmailTest /></NoIndex>} />
        <Route path="/admin/jobs" element={<NoIndex title="Job Processor"><JobProcessor /></NoIndex>} />
        <Route path="/admin/social-login" element={<NoIndex title="Social Login"><SocialLogin /></NoIndex>} />
        <Route path="/system-login" element={<Navigate to="/admin/crm" replace />} />
        <Route path="/admin/system-login" element={<Navigate to="/admin/crm" replace />} />
        <Route path="/admin/crm" element={<NoIndex title="CRM"><CRM /></NoIndex>} />
        <Route path="/admin/blog" element={<NoIndex title="Blog Admin"><BlogAdmin /></NoIndex>} />
        <Route path="/admin/login" element={<NoIndex title="Admin Login"><AdminLogin /></NoIndex>} />
        <Route path="/access-hub" element={<NoIndex title="Relocation Hub"><PermanentRelocationHub /></NoIndex>} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/earn-abroad" element={<EarnAbroad />} />
        <Route path="/living-wage-business" element={<LivingWageBusiness />} />
        <Route path="/digital-sales" element={<DigitalSales />} />
        <Route path="/multiple-options" element={<MultipleOptions />} />
        <Route path="/youtuber" element={<Youtuber />} />
        <Route path="/affiliate" element={<Affiliate />} />
        <Route path="/agency" element={<Agency />} />
        <Route path="/file-converter" element={<NoIndex title="File Converter"><FileConverter /></NoIndex>} />
      </Routes>
    </Router>
  );
}

export default App;

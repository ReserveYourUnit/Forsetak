import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Countries from './pages/Countries';
import Login from './pages/Login';
import More from './pages/More';
import Profile from './pages/Profile';
import MyApplications from './pages/MyApplications';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationSubmitted from './pages/ApplicationSubmitted';
import Payment from './pages/Payment';
import Legal from './pages/Legal';
import Professions from './pages/Professions';
import ProfessionDetail from './pages/ProfessionDetail';
import Settings from './pages/Settings';
import { SimplePage } from './pages/SimplePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplicants from './pages/admin/AdminApplicants';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCountries from './pages/admin/AdminCountries';
import AdminSettings from './pages/admin/AdminSettings';
import AdminJobs from './pages/admin/AdminJobs';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminProfessions from './pages/admin/AdminProfessions';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public applicant-facing app */}
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/countries" element={<Countries />} />
        <Route path="/login" element={<Login />} />
        <Route path="/more" element={<More />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/apply" element={<ApplicationForm />} />
        <Route path="/apply/:jobId" element={<ApplicationForm />} />
        <Route path="/submitted/:applicationNumber" element={<ApplicationSubmitted />} />
        <Route path="/payment/:applicationNumber" element={<Payment />} />
        <Route path="/legal/:page" element={<Legal />} />
        <Route path="/notifications" element={<SimplePage title="الإشعارات" description="لا توجد إشعارات جديدة حاليًا." />} />
        <Route path="/help" element={<SimplePage title="مركز المساعدة" description="تواصل معنا عبر WhatsApp من صفحة المزيد." />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/professions" element={<Professions />} />
        <Route path="/professions/:id" element={<ProfessionDetail />} />
        <Route path="/companies" element={<SimplePage title="الشركات الأجنبية" description="قائمة الشركات المعتمدة قريبًا." />} />
        <Route path="/tips" element={<SimplePage title="نصائح السفر والعمل" description="محتوى إرشادي قادم." />} />

        {/* Admin — separate route tree, gated by admin_users + RLS */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/applicants" element={<AdminApplicants />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/countries" element={<AdminCountries />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/companies" element={<AdminCompanies />} />
        <Route path="/admin/professions" element={<AdminProfessions />} />
      </Routes>
    </BrowserRouter>
  );
}

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
import Payment from './pages/Payment';
import Legal from './pages/Legal';
import { SimplePage } from './pages/SimplePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplicants from './pages/admin/AdminApplicants';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCountries from './pages/admin/AdminCountries';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
        <Route path="/payment/:applicationNumber" element={<Payment />} />
        <Route path="/legal/:page" element={<Legal />} />
        <Route path="/notifications" element={<SimplePage title="الإشعارات" description="لا توجد إشعارات جديدة حاليًا." />} />
        <Route path="/help" element={<SimplePage title="مركز المساعدة" description="تواصل معنا عبر WhatsApp من صفحة المزيد." />} />
        <Route path="/settings" element={<SimplePage title="الإعدادات" description="إعدادات الحساب واللغة والإشعارات." />} />
        <Route path="/professions" element={<SimplePage title="المهن والحرف" description="تصفح المهن المتاحة من صفحة الوظائف." />} />
        <Route path="/companies" element={<SimplePage title="الشركات الأجنبية" description="قائمة الشركات المعتمدة قريبًا." />} />
        <Route path="/tips" element={<SimplePage title="نصائح السفر والعمل" description="محتوى إرشادي قادم." />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/applicants" element={<AdminApplicants />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/countries" element={<AdminCountries />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </BrowserRouter>
  );
}

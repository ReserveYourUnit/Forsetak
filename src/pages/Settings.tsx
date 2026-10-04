import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { fetchCountries, fetchProfessions } from '../services/catalogService';
import { Country, Profession } from '../types';
import { Lang, updatePrefs, usePrefs } from '../lib/prefs';

const AR = {
  title: 'الإعدادات',
  language: 'اللغة',
  arabic: 'العربية',
  english: 'English',
  appearance: 'المظهر',
  light: 'الوضع الفاتح',
  dark: 'الوضع الداكن',
  account: 'إعدادات الحساب',
  name: 'الاسم',
  email: 'البريد الإلكتروني',
  phone: 'رقم الهاتف',
  editData: 'تعديل البيانات',
  save: 'حفظ',
  cancel: 'إلغاء',
  saved: 'تم الحفظ ✓',
  emailConfirm: 'تم الحفظ، وأُرسل رابط تأكيد إلى البريد الجديد.',
  notLoggedIn: 'سجّل الدخول لإدارة بيانات حسابك.',
  login: 'تسجيل الدخول',
  notConnected: 'الموقع غير متصل بقاعدة بيانات الحساب حاليًا.',
  changePassword: 'تغيير كلمة المرور',
  newPassword: 'كلمة المرور الجديدة',
  confirmPassword: 'تأكيد كلمة المرور',
  passwordChanged: 'تم تغيير كلمة المرور ✓',
  passwordShort: 'كلمة المرور يجب ألا تقل عن 6 أحرف.',
  passwordMismatch: 'كلمتا المرور غير متطابقتين.',
  notifications: 'الإشعارات',
  nNewJobs: 'إشعارات الوظائف الجديدة',
  nStatus: 'إشعارات حالة الطلبات',
  nMessages: 'إشعارات الرسائل',
  notifNote: 'تُحفظ تفضيلاتك على هذا الجهاز وتُستخدم عند تفعيل خدمة الإشعارات.',
  jobsSection: 'إعدادات الوظائف',
  favProfessions: 'المهن المفضلة',
  favCountries: 'الدول المفضلة',
  jobAlerts: 'تنبيهات الوظائف الجديدة',
  privacy: 'الخصوصية والأمان',
  logout: 'تسجيل الخروج',
  dataMgmt: 'إدارة بيانات الحساب',
  myApplications: 'طلباتي',
  resetSettings: 'إعادة ضبط إعدادات هذا الجهاز',
  resetConfirm: 'سيتم مسح اللغة والمظهر والمفضلة والإشعارات المحفوظة على هذا الجهاز. متابعة؟',
  app: 'إعدادات التطبيق',
  about: 'حول الموقع',
  privacyPolicy: 'سياسة الخصوصية',
  terms: 'شروط الاستخدام',
  back: 'رجوع',
  loading: 'جاري التحميل...'
};

type Dict = typeof AR;

const EN: Dict = {
  title: 'Settings',
  language: 'Language',
  arabic: 'العربية',
  english: 'English',
  appearance: 'Appearance',
  light: 'Light mode',
  dark: 'Dark mode',
  account: 'Account settings',
  name: 'Name',
  email: 'Email',
  phone: 'Phone number',
  editData: 'Edit details',
  save: 'Save',
  cancel: 'Cancel',
  saved: 'Saved ✓',
  emailConfirm: 'Saved. A confirmation link was sent to the new email.',
  notLoggedIn: 'Sign in to manage your account details.',
  login: 'Sign in',
  notConnected: 'The site is not connected to the account database right now.',
  changePassword: 'Change password',
  newPassword: 'New password',
  confirmPassword: 'Confirm password',
  passwordChanged: 'Password changed ✓',
  passwordShort: 'Password must be at least 6 characters.',
  passwordMismatch: 'Passwords do not match.',
  notifications: 'Notifications',
  nNewJobs: 'New job notifications',
  nStatus: 'Application status notifications',
  nMessages: 'Message notifications',
  notifNote: 'Your preferences are saved on this device and used once notifications are enabled.',
  jobsSection: 'Job settings',
  favProfessions: 'Favorite professions',
  favCountries: 'Favorite countries',
  jobAlerts: 'New job alerts',
  privacy: 'Privacy & security',
  logout: 'Sign out',
  dataMgmt: 'Manage account data',
  myApplications: 'My applications',
  resetSettings: 'Reset this device settings',
  resetConfirm: 'This clears the language, theme, favorites and notification choices saved on this device. Continue?',
  app: 'App settings',
  about: 'About the site',
  privacyPolicy: 'Privacy policy',
  terms: 'Terms of use',
  back: 'Back',
  loading: 'Loading...'
};

const DICTS: Record<Lang, Dict> = { ar: AR, en: EN };

// أسماء الصفحات القانونية في مسار /legal/:page
const LEGAL = { about: 'about', privacy: 'privacy', terms: 'terms' };

type Msg = { ok: boolean; text: string } | null;

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-sky focus:outline-none';

export default function Settings() {
  const navigate = useNavigate();
  const prefs = usePrefs();
  const t = DICTS[prefs.lang];

  const [professions, setProfessions] = useState<Profession[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [accountMsg, setAccountMsg] = useState<Msg>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<Msg>(null);

  async function loadUser() {
    if (!isSupabaseConfigured) {
      setAuthChecked(true);
      return;
    }
    const { data } = await supabase.auth.getUser();
    const u = data.user;
    setUserEmail(u?.email ?? null);
    setName((u?.user_metadata?.full_name as string | undefined) ?? '');
    setPhone((u?.user_metadata?.phone as string | undefined) ?? '');
    setEmailDraft(u?.email ?? '');
    setAuthChecked(true);
  }

  useEffect(() => {
    loadUser();
    fetchProfessions().then(setProfessions);
    fetchCountries().then(setCountries);
  }, []);

  async function saveAccount() {
    setBusy(true);
    setAccountMsg(null);
    const trimmedEmail = emailDraft.trim();
    const emailChanged = trimmedEmail !== '' && trimmedEmail !== userEmail;
    const payload: { email?: string; data: Record<string, string> } = {
      data: { full_name: name.trim(), phone: phone.trim() }
    };
    if (emailChanged) payload.email = trimmedEmail;
    const { error } = await supabase.auth.updateUser(payload);
    setBusy(false);
    if (error) {
      setAccountMsg({ ok: false, text: error.message });
      return;
    }
    setAccountMsg({ ok: true, text: emailChanged ? t.emailConfirm : t.saved });
    setEditing(false);
    loadUser();
  }

  async function changePassword() {
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ ok: false, text: t.passwordShort });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: t.passwordMismatch });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (error) {
      setPasswordMsg({ ok: false, text: error.message });
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg({ ok: true, text: t.passwordChanged });
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  function toggleFav(key: 'favProfessions' | 'favCountries', id: string) {
    const list = prefs[key];
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    if (key === 'favProfessions') updatePrefs({ favProfessions: next });
    else updatePrefs({ favCountries: next });
  }

  function setNotif(key: 'newJobs' | 'applicationStatus' | 'messages', value: boolean) {
    updatePrefs({ notifications: { ...prefs.notifications, [key]: value } });
  }

  function resetDevice() {
    if (!window.confirm(t.resetConfirm)) return;
    updatePrefs({
      lang: 'ar',
      theme: 'light',
      notifications: { newJobs: true, applicationStatus: true, messages: true },
      favProfessions: [],
      favCountries: []
    });
  }

  const chevron = prefs.lang === 'ar' ? '‹' : '›';

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <button onClick={() => navigate(-1)} aria-label={t.back}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">{t.title}</h1>
      </div>

      <div className="mx-4 mt-4 space-y-4">
        {/* اللغة */}
        <Section title={t.language}>
          <div className="grid grid-cols-2 gap-2">
            <Choice label={t.arabic} active={prefs.lang === 'ar'} onClick={() => updatePrefs({ lang: 'ar' })} />
            <Choice label={t.english} active={prefs.lang === 'en'} onClick={() => updatePrefs({ lang: 'en' })} />
          </div>
        </Section>

        {/* المظهر */}
        <Section title={t.appearance}>
          <div className="grid grid-cols-2 gap-2">
            <Choice label={t.light} active={prefs.theme === 'light'} onClick={() => updatePrefs({ theme: 'light' })} />
            <Choice label={t.dark} active={prefs.theme === 'dark'} onClick={() => updatePrefs({ theme: 'dark' })} />
          </div>
        </Section>

        {/* الحساب */}
        <Section title={t.account}>
          {!authChecked && <p className="text-sm text-slate-400">{t.loading}</p>}

          {authChecked && !isSupabaseConfigured && <p className="text-sm text-slate-500">{t.notConnected}</p>}

          {authChecked && isSupabaseConfigured && !userEmail && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">{t.notLoggedIn}</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-2xl bg-navy py-3 text-sm font-bold text-white shadow-card"
              >
                {t.login}
              </button>
            </div>
          )}

          {authChecked && userEmail && !editing && (
            <div className="space-y-3">
              <InfoRow label={t.name} value={name || '—'} />
              <InfoRow label={t.email} value={userEmail} ltr />
              <InfoRow label={t.phone} value={phone || '—'} ltr />
              <button
                onClick={() => {
                  setAccountMsg(null);
                  setEditing(true);
                }}
                className="w-full rounded-2xl bg-navy py-3 text-sm font-bold text-white shadow-card"
              >
                {t.editData}
              </button>
            </div>
          )}

          {authChecked && userEmail && editing && (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">{t.name}</span>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">{t.email}</span>
                <input
                  className={inputCls}
                  dir="ltr"
                  type="email"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">{t.phone}</span>
                <input
                  className={inputCls}
                  dir="ltr"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <div className="flex gap-2">
                <button
                  onClick={saveAccount}
                  disabled={busy}
                  className="flex-1 rounded-2xl bg-navy py-3 text-sm font-bold text-white shadow-card disabled:opacity-60"
                >
                  {t.save}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    loadUser();
                  }}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}

          {accountMsg && <Notice msg={accountMsg} />}
        </Section>

        {/* الإشعارات */}
        <Section title={t.notifications}>
          <Toggle label={t.nNewJobs} value={prefs.notifications.newJobs} onChange={(v) => setNotif('newJobs', v)} />
          <Toggle
            label={t.nStatus}
            value={prefs.notifications.applicationStatus}
            onChange={(v) => setNotif('applicationStatus', v)}
          />
          <Toggle label={t.nMessages} value={prefs.notifications.messages} onChange={(v) => setNotif('messages', v)} />
          <p className="mt-2 text-[11px] text-slate-400">{t.notifNote}</p>
        </Section>

        {/* الوظائف */}
        <Section title={t.jobsSection}>
          <p className="mb-2 text-sm font-medium text-slate-600">{t.favProfessions}</p>
          <div className="flex flex-wrap gap-2">
            {professions.map((p) => (
              <Chip
                key={p.id}
                label={p.name}
                active={prefs.favProfessions.includes(p.id)}
                onClick={() => toggleFav('favProfessions', p.id)}
              />
            ))}
          </div>

          <p className="mb-2 mt-4 text-sm font-medium text-slate-600">{t.favCountries}</p>
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => (
              <Chip
                key={c.id}
                label={`${c.flag_url} ${c.name}`}
                active={prefs.favCountries.includes(c.id)}
                onClick={() => toggleFav('favCountries', c.id)}
              />
            ))}
          </div>

          <div className="mt-3 border-t border-slate-100 pt-1">
            <Toggle label={t.jobAlerts} value={prefs.notifications.newJobs} onChange={(v) => setNotif('newJobs', v)} />
          </div>
        </Section>

        {/* الخصوصية والأمان */}
        <Section title={t.privacy}>
          {userEmail ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-600">{t.changePassword}</p>
              <input
                className={inputCls}
                type="password"
                placeholder={t.newPassword}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                className={inputCls}
                type="password"
                placeholder={t.confirmPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                onClick={changePassword}
                disabled={busy}
                className="w-full rounded-2xl bg-navy py-3 text-sm font-bold text-white shadow-card disabled:opacity-60"
              >
                {t.changePassword}
              </button>
              {passwordMsg && <Notice msg={passwordMsg} />}

              <div className="border-t border-slate-100 pt-3">
                <button
                  onClick={logout}
                  className="w-full rounded-2xl bg-rose-50 py-3 text-sm font-bold text-rose-600"
                >
                  {t.logout}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t.notLoggedIn}</p>
          )}

          <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
            <p className="mb-1 text-sm font-medium text-slate-600">{t.dataMgmt}</p>
            <LinkRow label={t.myApplications} chevron={chevron} onClick={() => navigate('/my-applications')} />
            <LinkRow label={t.resetSettings} chevron={chevron} onClick={resetDevice} />
          </div>
        </Section>

        {/* التطبيق */}
        <Section title={t.app}>
          <LinkRow label={t.about} chevron={chevron} onClick={() => navigate(`/legal/${LEGAL.about}`)} />
          <LinkRow label={t.privacyPolicy} chevron={chevron} onClick={() => navigate(`/legal/${LEGAL.privacy}`)} />
          <LinkRow label={t.terms} chevron={chevron} onClick={() => navigate(`/legal/${LEGAL.terms}`)} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <p className="mb-3 text-sm font-bold text-navy">{title}</p>
      {children}
    </div>
  );
}

function Choice({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border py-3 text-sm font-bold ${
        active ? 'border-navy bg-navy text-white' : 'border-slate-200 bg-slate-50 text-navy'
      }`}
    >
      {label}
    </button>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs ${
        active ? 'border-navy bg-navy text-white' : 'border-slate-200 bg-white text-slate-600'
      }`}
    >
      {label}
    </button>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-slate-600">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${value ? 'bg-sky' : 'bg-slate-200'}`}
      >
        <span
          className="absolute top-0.5 block h-5 w-5 rounded-full shadow transition-all"
          style={{ insetInlineStart: value ? 22 : 2, backgroundColor: '#ffffff' }}
        />
      </button>
    </div>
  );
}

function InfoRow({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="min-w-0 truncate font-medium text-navy" dir={ltr ? 'ltr' : undefined}>
        {value}
      </span>
    </div>
  );
}

function LinkRow({ label, chevron, onClick }: { label: string; chevron: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between py-2.5 text-sm text-slate-600">
      <span>{label}</span>
      <span className="text-lg text-slate-400">{chevron}</span>
    </button>
  );
}

function Notice({ msg }: { msg: { ok: boolean; text: string } }) {
  return (
    <p
      className={`mt-3 rounded-xl p-3 text-sm ${
        msg.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
      }`}
    >
      {msg.text}
    </p>
  );
    }

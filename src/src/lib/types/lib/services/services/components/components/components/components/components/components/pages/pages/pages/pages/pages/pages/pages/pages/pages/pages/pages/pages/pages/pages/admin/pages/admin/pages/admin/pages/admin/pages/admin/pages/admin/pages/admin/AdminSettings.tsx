import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

const KEYS = [
  { key: 'PAYMENT_WALLET_NUMBER', label: 'رقم محفظة الدفع', placeholder: 'مثال: 010XXXXXXXX' },
  { key: 'WHATSAPP_OFFICIAL_NUMBER', label: 'رقم WhatsApp الرسمي', placeholder: '+20 12 82406110' },
  { key: 'APPLICATION_FEE_EGP', label: 'قيمة رسوم الاستمارة (جنيه)', placeholder: '105' },
  { key: 'APP_NAME', label: 'اسم التطبيق', placeholder: 'فرصتك' }
];

export default function AdminSettings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) return;
      const { data } = await supabase.from('system_settings').select('key, value');
      const map: Record<string, string> = {};
      (data ?? []).forEach((row) => (map[row.key] = row.value));
      setValues(map);
    }
    load();
  }, []);

  async function save() {
    if (!isSupabaseConfigured) return;
    setSaving(true);
    await Promise.all(
      KEYS.map((k) =>
        supabase.from('system_settings').upsert({ key: k.key, value: values[k.key] ?? '', updated_at: new Date().toISOString() })
      )
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar active="settings" />
      <main className="flex-1 p-6">
        <h1 className="mb-4 text-xl font-extrabold text-navy">الإعدادات</h1>

        {!isSupabaseConfigured && (
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            لوحة الإدارة غير متصلة بقاعدة بيانات حقيقية بعد، لذلك لا يمكن حفظ إعدادات فعلية الآن.
          </p>
        )}

        <div className="max-w-lg space-y-4 rounded-2xl bg-white p-5 shadow-card">
          {KEYS.map((k) => (
            <div key={k.key}>
              <label className="mb-1 block text-sm font-medium text-slate-600">{k.label}</label>
              <input
                value={values[k.key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [k.key]: e.target.value }))}
                placeholder={k.placeholder}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-sky focus:outline-none"
              />
            </div>
          ))}
          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-2xl bg-navy py-3 text-sm font-bold text-white shadow-card disabled:opacity-60"
          >
            {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
          </button>
        </div>
      </main>
    </div>
  );
                  }

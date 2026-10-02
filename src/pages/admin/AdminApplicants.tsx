import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { APPLICATION_STATUS_LABELS_AR, ApplicationStatus } from '../../types';

interface Row {
  id: string;
  application_number: string;
  status: ApplicationStatus;
  applicant_id: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  governorate_id: string;
  desired_country_id: string;
}

const TEMPLATE_KEY = 'payment_request';
const FEE = 105;

const DEFAULT_TEMPLATE =
  'مرحبًا {name}،\n' +
  'تم استلام طلبك رقم {number} على منصة فرصتك.\n' +
  'لإتمام الطلب برجاء سداد رسوم الاستمارة ({fee} جنيه مصري) ثم رفع إيصال الدفع من الرابط التالي:\n' +
  '{link}';

// يحوّل رقم الواتساب لصيغة دولية (مصر) مناسبة لرابط wa.me
function toWaNumber(raw: string): string | null {
  if (!raw) return null;
  const latin = raw.replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632));
  let digits = latin.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = '20' + digits.slice(1);
  return digits.length >= 10 ? digits : null;
}

function buildMessage(template: string, r: Row) {
  const link = `${window.location.origin}/payment/${r.application_number}`;
  return template
    .split('{name}').join(r.full_name)
    .split('{number}').join(r.application_number)
    .split('{fee}').join(String(FEE))
    .split('{link}').join(link);
}

export default function AdminApplicants() {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ full_name: '', phone: '', whatsapp: '' });

  async function load() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select(
        'id, application_number, status, applicant:applicants(id, full_name, phone, whatsapp, governorate_id, desired_country_id)'
      )
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) setMsg(error.message);
    setRows(
      (data ?? []).map((r: any) => ({
        id: r.id,
        application_number: r.application_number,
        status: r.status,
        applicant_id: r.applicant?.id ?? '',
        full_name: r.applicant?.full_name ?? '',
        phone: r.applicant?.phone ?? '',
        whatsapp: r.applicant?.whatsapp ?? '',
        governorate_id: r.applicant?.governorate_id ?? '',
        desired_country_id: r.applicant?.desired_country_id ?? ''
      }))
    );
    setLoading(false);
  }

  async function loadTemplate() {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from('message_templates')
      .select('body')
      .eq('key', TEMPLATE_KEY)
      .maybeSingle();
    if (data?.body) setTemplate(data.body);
  }

  useEffect(() => {
    load();
    loadTemplate();
  }, []);

  async function changeStatus(id: string, status: ApplicationStatus) {
    await supabase.from('applications').update({ status }).eq('id', id);
    load();
  }

  async function saveTemplate() {
    setSavingTemplate(true);
    const { error } = await supabase
      .from('message_templates')
      .upsert({ key: TEMPLATE_KEY, body: template, updated_at: new Date().toISOString() });
    setSavingTemplate(false);
    setMsg(error ? error.message : 'تم حفظ الرسالة ✓');
  }

  function startEdit(r: Row) {
    setEditingId(r.id);
    setDraft({ full_name: r.full_name, phone: r.phone, whatsapp: r.whatsapp });
  }

  async function saveEdit(r: Row) {
    const { error } = await supabase.from('applicants').update(draft).eq('id', r.applicant_id);
    if (error) {
      setMsg(error.message);
      return;
    }
    setEditingId(null);
    setMsg('تم حفظ التعديل ✓');
    load();
  }

  async function remove(r: Row) {
    if (!window.confirm(`حذف طلب "${r.full_name}" رقم ${r.application_number}؟ لا يمكن التراجع.`)) return;
    const { error } = await supabase.from('applications').delete().eq('id', r.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    if (r.applicant_id) {
      await supabase.from('applicants').delete().eq('id', r.applicant_id);
    }
    setMsg('تم حذف الطلب ✓');
    load();
  }

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.trim();
    return [r.full_name, r.application_number, r.phone, r.whatsapp].some((v) => v.includes(q));
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar active="applicants" />
      <main className="min-w-0 flex-1 p-4 md:p-6">
        <h1 className="mb-4 text-xl font-extrabold text-navy">المتقدمون</h1>

        {!isSupabaseConfigured && (
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            لوحة الإدارة غير متصلة بقاعدة بيانات حقيقية بعد.
          </p>
        )}

        {msg && <p className="mb-3 rounded-xl bg-white p-3 text-sm text-slate-600 shadow-card">{msg}</p>}

        <div className="mb-4 rounded-2xl bg-white p-4 shadow-card">
          <button
            onClick={() => setTemplateOpen((o) => !o)}
            className="flex w-full items-center justify-between text-sm font-bold text-navy"
          >
            <span>رسالة الواتساب المحفوظة</span>
            <span className="text-xs text-sky">{templateOpen ? 'إخفاء' : 'تعديل'}</span>
          </button>
          {templateOpen && (
            <div className="mt-3 space-y-2">
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={7}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed"
              />
              <p className="text-[11px] text-slate-400">
                تُستبدل تلقائيًا لكل متقدم: {'{name}'} الاسم · {'{number}'} رقم الطلب · {'{fee}'} الرسوم ·{' '}
                {'{link}'} رابط صفحة الدفع
              </p>
              <div className="flex gap-2">
                <button
                  onClick={saveTemplate}
                  disabled={savingTemplate}
                  className="flex-1 rounded-xl bg-navy py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {savingTemplate ? 'جاري الحفظ...' : 'حفظ الرسالة'}
                </button>
                <button
                  onClick={() => setTemplate(DEFAULT_TEMPLATE)}
                  className="rounded-xl bg-slate-100 px-3 py-2.5 text-sm text-slate-600"
                >
                  الافتراضية
                </button>
              </div>
            </div>
          )}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم، رقم الطلب، الهاتف أو WhatsApp"
          className="mb-4 w-full max-w-md rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-sky focus:outline-none"
        />

        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="p-3 text-right">رقم الطلب</th>
                <th className="p-3 text-right">الاسم</th>
                <th className="p-3 text-right">الهاتف / WhatsApp</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    جاري التحميل...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    لا توجد نتائج.
                  </td>
                </tr>
              )}
              {filtered.map((r) => {
                const wa = toWaNumber(r.whatsapp);
                const waHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(buildMessage(template, r))}` : null;
                const isOpen = openId === r.id;
                const isEditing = editingId === r.id;
                return (
                  <>
                    <tr key={r.id} className="border-b border-slate-50">
                      <td className="p-3 font-medium text-navy">{r.application_number}</td>
                      <td className="p-3">{r.full_name}</td>
                      <td className="p-3">
                        {r.phone}
                        <br />
                        {waHref ? (
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                          >
                            إرسال واتساب
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">رقم واتساب غير صالح</span>
                        )}
                      </td>
                      <td className="p-3">
                        <select
                          value={r.status}
                          onChange={(e) => changeStatus(r.id, e.target.value as ApplicationStatus)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        >
                          {Object.entries(APPLICATION_STATUS_LABELS_AR).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setOpenId(isOpen ? null : r.id)}
                          className="rounded-lg bg-sky-50 px-2 py-1 text-xs text-sky"
                        >
                          {isOpen ? 'إغلاق' : 'لوحة التحكم'}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr key={r.id + '-panel'} className="border-b border-slate-50 bg-slate-50">
                        <td colSpan={5} className="p-3">
                          {!isEditing ? (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => startEdit(r)}
                                className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700"
                              >
                                تعديل البيانات
                              </button>
                              <button
                                onClick={() => remove(r)}
                                className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-600"
                              >
                                حذف الطلب
                              </button>
                            </div>
                          ) : (
                            <div className="max-w-md space-y-2">
                              <EditField
                                label="الاسم"
                                value={draft.full_name}
                                onChange={(v) => setDraft((d) => ({ ...d, full_name: v }))}
                              />
                              <EditField
                                label="الهاتف"
                                value={draft.phone}
                                onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
                              />
                              <EditField
                                label="واتساب"
                                value={draft.whatsapp}
                                onChange={(v) => setDraft((d) => ({ ...d, whatsapp: v }))}
                              />
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => saveEdit(r)}
                                  className="flex-1 rounded-xl bg-navy py-2.5 text-sm font-bold text-white"
                                >
                                  حفظ
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm text-slate-600"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
      />
    </label>
  );
    }

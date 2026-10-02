import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ApplicationSubmitted() {
  const { applicationNumber } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(String(applicationNumber ?? ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-10">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-2xl bg-white p-6 text-center shadow-card">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
            ✓
          </div>
          <h1 className="text-lg font-extrabold text-navy">تم استلام طلبك</h1>
          <p className="mt-1 text-sm text-slate-500">احتفظ برقم الطلب للمتابعة مع فريق الإدارة.</p>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">رقم الطلب</p>
            <p className="mt-1 text-2xl font-extrabold tracking-wide text-navy" dir="ltr">
              {applicationNumber}
            </p>
            <button onClick={copy} className="mt-2 rounded-lg bg-sky-50 px-3 py-1 text-xs text-sky-600">
              {copied ? 'تم النسخ ✓' : 'نسخ الرقم'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-700">
          تم إرسال طلبكم بنجاح، وسيتم التواصل معكم من خلال إدارة منصة فرصتك عبر WhatsApp على الرقم الذي تم تسجيله،
          وسيتم إرسال تعليمات استكمال الطلب والتفاصيل الخاصة بطلبكم عبر الرسائل.
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full rounded-2xl bg-navy py-3.5 text-sm font-bold text-white shadow-card"
        >
          الرجوع للرئيسية
        </button>
      </div>
    </div>
  );
}

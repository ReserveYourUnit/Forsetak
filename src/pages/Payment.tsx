import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function Payment() {
  const { applicationNumber } = useParams();
  const [walletNumber, setWalletNumber] = useState<string | null>(null);
  const [feeAmount, setFeeAmount] = useState<number>(105);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [txRef, setTxRef] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      if (!isSupabaseConfigured) return;
      const { data } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['PAYMENT_WALLET_NUMBER', 'APPLICATION_FEE_EGP']);
      const wallet = data?.find((d) => d.key === 'PAYMENT_WALLET_NUMBER')?.value;
      const fee = data?.find((d) => d.key === 'APPLICATION_FEE_EGP')?.value;
      if (wallet) setWalletNumber(wallet);
      if (fee) setFeeAmount(Number(fee));
    }
    loadSettings();
  }, []);

  async function uploadReceipt() {
    if (!receiptFile) {
      setError('يرجى إرفاق صورة إيصال الدفع أولًا.');
      return;
    }
    if (!isSupabaseConfigured) {
      setError('التطبيق غير متصل بقاعدة بيانات حقيقية بعد، لذلك لا يمكن رفع الإيصال فعليًا الآن.');
      return;
    }
    setStatus('uploading');
    setError(null);

    const path = `${applicationNumber}/${Date.now()}-${receiptFile.name}`;
    const { error: uploadError } = await supabase.storage.from('payment-receipts').upload(path, receiptFile);
    if (uploadError) {
      setStatus('error');
      setError(uploadError.message);
      return;
    }
    const { error: insertError } = await supabase.from('payments').insert({
      amount: feeAmount,
      currency: 'EGP',
      payment_method: 'cash_wallet',
      wallet_number: walletNumber,
      receipt_url: path,
      transaction_reference: txRef || null,
      status: 'pending'
    });
    if (insertError) {
      setStatus('error');
      setError(insertError.message);
      return;
    }
    setStatus('done');
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="rounded-2xl bg-white p-5 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">✅</div>
        <h1 className="mt-3 font-bold text-navy">تم استلام طلبك بنجاح</h1>
        <p className="mt-1 text-sm text-slate-500">رقم طلبك</p>
        <p className="mt-1 text-lg font-extrabold text-sky">{applicationNumber}</p>
        <p className="mt-2 text-xs text-slate-400">سيتم مراجعة بياناتك من فريق الإدارة.</p>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-card">
        <h2 className="font-bold text-navy">رسوم استمارة تأكيد الطلب</h2>
        <p className="mt-1 text-2xl font-extrabold text-amber">{feeAmount} جنيه مصري</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          تشمل الرسوم تسجيل بيانات المتقدم ومراجعة طلبه وإدراجه ضمن طلبات المتقدمين للفرص المتاحة بالدولة والمجال الذي
          اختاره، وفقًا للفرص والشروط المتوفرة.
        </p>
        <p className="mt-2 rounded-xl bg-rose-50 p-3 text-xs leading-relaxed text-rose-600">
          سداد رسوم الاستمارة لا يُعد ضمانًا للحصول على وظيفة أو تأشيرة أو عقد عمل أو السفر، ويخضع الترشيح والقبول النهائي
          لشروط جهة العمل والجهات المختصة.
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-card">
        <h2 className="font-bold text-navy">الدفع عبر المحفظة الإلكترونية</h2>
        {walletNumber ? (
          <>
            <p className="mt-2 text-sm text-slate-500">يرجى تحويل رسوم الاستمارة إلى رقم المحفظة الموضح أدناه:</p>
            <p className="mt-2 rounded-xl bg-slate-50 p-3 text-center text-lg font-bold tracking-wider text-navy">
              {walletNumber}
            </p>
          </>
        ) : (
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
            لم يقم فريق الإدارة بعد بإدخال رقم محفظة الدفع من لوحة الإعدادات (PAYMENT_WALLET_NUMBER)، لذلك لا يمكن عرض رقم
            حقيقي الآن.
          </p>
        )}

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">صورة إيصال الدفع</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-dashed border-slate-300 p-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">رقم العملية (إن وجد)</label>
            <input
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-sky focus:outline-none"
            />
          </div>

          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
          {status === 'done' && (
            <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
              تم رفع الإيصال بنجاح. حالة الدفع الآن: قيد المراجعة من الإدارة.
            </p>
          )}

          <button
            onClick={uploadReceipt}
            disabled={status === 'uploading' || status === 'done'}
            className="w-full rounded-2xl bg-navy py-3.5 text-sm font-bold text-white shadow-card disabled:opacity-60"
          >
            {status === 'uploading' ? 'جاري الرفع...' : 'تم الدفع – رفع إيصال الدفع'}
          </button>
        </div>
      </div>
    </div>
  );
}

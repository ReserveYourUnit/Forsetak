import { useNavigate } from 'react-router-dom';

const TIPS: { title: string; body: string }[] = [
  {
    title: 'قبل السفر',
    body: 'تأكد من قراءة تفاصيل عرض العمل جيدًا، ومعرفة طبيعة الوظيفة والراتب ومكان العمل وساعات العمل وأي مزايا أخرى يقدمها صاحب العمل.'
  },
  {
    title: 'راجع مستنداتك',
    body: 'تأكد من أن جواز سفرك وجميع المستندات المطلوبة سارية وصحيحة، واحتفظ بنسخ إلكترونية وورقية منها في مكان آمن.'
  },
  {
    title: 'تحقق من جهة العمل',
    body: 'احرص على معرفة اسم جهة العمل وعنوانها وطبيعة نشاطها وبيانات التواصل معها، وتأكد من أن جميع تفاصيل الوظيفة واضحة قبل اتخاذ قرار السفر.'
  },
  {
    title: 'اقرأ عقد العمل بعناية',
    body: 'لا توافق على أي عقد قبل قراءة جميع بنوده وفهم حقوقك وواجباتك، وخاصة ما يتعلق بالراتب والسكن ومدة العقد وساعات العمل والإجازات.'
  },
  {
    title: 'تعرف على قوانين الدولة',
    body: 'اطلع على أهم القوانين والأنظمة المتعلقة بالعمل والإقامة في الدولة التي ستسافر إليها، والتزم بها طوال فترة إقامتك.'
  },
  {
    title: 'احتفظ ببيانات مهمة',
    body: 'احتفظ بأرقام التواصل الخاصة بجهة العمل وعنوان السكن وأرقام الطوارئ وبيانات السفارة أو القنصلية التابعة لبلدك.'
  },
  {
    title: 'لا تتسرع في اتخاذ القرار',
    body: 'احرص على مراجعة جميع تفاصيل العرض والإجراءات والرسوم المطلوبة قبل دفع أي مبالغ أو استكمال إجراءات السفر.'
  },
  {
    title: 'احذر من العروض غير الواضحة',
    body: 'لا تعتمد على أي عرض عمل لا يحتوي على معلومات واضحة عن جهة العمل أو طبيعة الوظيفة أو شروط التعاقد، وتجنب إرسال مستنداتك أو دفع أي مبالغ لجهات غير موثوقة.'
  }
];

export default function Tips() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <button onClick={() => navigate(-1)} aria-label="رجوع">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">نصائح السفر والعمل</h1>
      </div>

      <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="mb-2 font-bold text-navy">نصائح مهمة قبل السفر للعمل</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          يُعد السفر للعمل خطوة مهمة في حياة كل شخص، ولذلك فإن الاستعداد الجيد والتأكد من جميع التفاصيل قبل السفر
          يساعدانك على بدء تجربتك بثقة وأمان.
        </p>
      </div>

      <div className="mx-4 mt-4 space-y-3">
        {TIPS.map((t, i) => (
          <div key={i} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-bold text-sky-600">
                {i + 1}
              </div>
              <div>
                <h3 className="font-bold text-navy">{t.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{t.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-4 mt-4 rounded-2xl bg-amber-50 p-4 shadow-card">
        <h3 className="mb-1 font-bold text-navy">نصيحتنا لك</h3>
        <p className="text-sm leading-relaxed text-slate-600">
          خطط جيدًا، وتحقق من كل التفاصيل، ولا تتخذ قرار السفر إلا بعد التأكد من صحة العرض والإجراءات المطلوبة.
        </p>
      </div>

      <p className="mx-4 mt-6 text-center text-sm font-bold text-navy">
        رحلتك نحو فرصة عمل أفضل تبدأ بخطوة صحيحة.
      </p>
    </div>
  );
}

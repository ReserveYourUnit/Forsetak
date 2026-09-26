import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();
  return (
    <div className="relative flex min-h-screen flex-col justify-end overflow-hidden bg-navy text-white">
      <img
        src="/assets/hero-traveler.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/30" />

      <div className="relative z-10 flex flex-col items-center px-6 pt-16 text-center">
        <img src="/assets/logo.png" alt="فرصتك" className="h-28 w-28 rounded-full object-cover shadow-cardHover" />
        <h1 className="mt-4 text-3xl font-extrabold">فرصتك</h1>
        <p className="mt-1 text-sm text-slate-200">وظائف .. مهن .. حرف .. سفر للعمل</p>
      </div>

      <div className="relative z-10 px-6 pb-10 pt-24 text-center">
        <p className="mb-6 text-lg font-semibold">مستقبلك يبدأ من هنا</p>
        <button
          onClick={() => navigate('/home')}
          className="w-full rounded-2xl bg-amber py-4 text-base font-bold text-navy shadow-cardHover transition hover:bg-amber-300"
        >
          ابدأ الآن
        </button>
      </div>
    </div>
  );
}

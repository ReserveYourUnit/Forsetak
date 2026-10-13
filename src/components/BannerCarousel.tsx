import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../types/banner';

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const current = banners[index];

  return (
    <div className="mx-4 mt-4">
      <div className="flex min-h-[72px] w-full flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-amber to-amber-400 px-5 py-4 text-center shadow-card">
        <p className="text-sm font-bold leading-relaxed text-navy">{current.text_content}</p>
        <Link
          to="/apply"
          className="rounded-xl bg-navy px-6 py-2.5 text-sm font-bold text-white shadow-cardHover"
        >
          قدّم الآن
        </Link>
      </div>
      {banners.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setIndex(i)}
              aria-label={`إعلان ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-navy' : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

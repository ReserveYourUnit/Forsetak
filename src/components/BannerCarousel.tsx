import { useEffect, useState } from 'react';
import { Banner } from '../types/banner';

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const current = banners[index];

  function openLink() {
    if (current.link_url) {
      window.open(current.link_url, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="mx-4 mt-4">
      <div
        onClick={openLink}
        className={`relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-card ${
          current.link_url ? 'cursor-pointer' : ''
        }`}
      >
        {current.media_type === 'video' ? (
          <video
            key={current.id}
            src={current.media_url}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img key={current.id} src={current.media_url} alt="إعلان" className="h-full w-full object-cover" />
        )}
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

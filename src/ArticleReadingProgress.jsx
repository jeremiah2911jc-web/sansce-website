import { useEffect, useState } from 'react';

export default function ArticleReadingProgress({ enabled }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const body = document.querySelector('.knowledge-body');
    if (!body) return;
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = body.getBoundingClientRect();
        const total = Math.max(1, bounds.height - window.innerHeight * .55);
        setProgress(Math.min(100, Math.max(0, (-bounds.top + window.innerHeight * .25) / total * 100)));
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(body);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [enabled]);

  return enabled ? <progress className="sx-reading-progress" aria-label="文章閱讀進度" value={progress} max="100" /> : null;
}

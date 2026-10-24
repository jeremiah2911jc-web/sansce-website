import { useEffect, useRef } from 'react';
import './header-scripture.css';

const verse = '就是行為正直、做事公義、心裡說實話的人。';

export default function HeaderScripture() {
  const quote = useRef(null);
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 760px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const node = quote.current;
    const track = node.querySelector('.sx-scripture-track');
    const copy = node.querySelector('.sx-scripture-copy');
    const viewport = node.querySelector('.sx-scripture-window');
    let animations = [];
    let reading = false;
    const stop = () => {
      animations.forEach(animation => animation.cancel());
      animations = [];
    };
    const enabled = () => mobile.matches && !reduced.matches && !document.hidden;
    const animate = (element, frames, timing) => {
      animations.push(element.animate(frames, timing));
    };
    const start = () => {
      stop();
      if (!enabled()) return;
      // Both copies have the same width, including the gap. One complete copy
      // travels past the window before the identical copy takes its place.
      const distance = copy.getBoundingClientRect().width;
      animate(track, [{ transform: 'translateX(0)' }, { transform: `translateX(-${distance}px)` }], {
        duration: distance / 14 * 1000, delay: 1400, iterations: Infinity, easing: 'linear', fill: 'backwards',
      });
      if (reading) animations.forEach(animation => animation.pause());
    };
    const pause = () => { reading = true; animations.forEach(animation => animation.pause()); };
    const resume = () => { reading = false; if (enabled()) animations.forEach(animation => animation.play()); };
    const leave = () => { if (document.activeElement !== viewport) resume(); };
    const visibility = () => {
      if (document.hidden) animations.forEach(animation => animation.pause());
      else if (enabled() && animations.length && !reading) animations.forEach(animation => animation.play());
      else start();
    };
    const resize = new ResizeObserver(start);
    resize.observe(node);
    let active = true;
    document.fonts.ready.then(() => { if (active) start(); });
    mobile.addEventListener('change', start);
    reduced.addEventListener('change', start);
    document.addEventListener('visibilitychange', visibility);
    viewport.addEventListener('focus', pause);
    viewport.addEventListener('blur', resume);
    viewport.addEventListener('pointerenter', pause);
    viewport.addEventListener('pointerleave', leave);
    start();
    return () => {
      active = false;
      stop();
      resize.disconnect();
      mobile.removeEventListener('change', start);
      reduced.removeEventListener('change', start);
      document.removeEventListener('visibilitychange', visibility);
      viewport.removeEventListener('focus', pause);
      viewport.removeEventListener('blur', resume);
      viewport.removeEventListener('pointerenter', pause);
      viewport.removeEventListener('pointerleave', leave);
    };
  }, []);

  return <blockquote ref={quote} className="sx-header-scripture" aria-label={verse + ' 詩篇十五篇二節'}>
    <span className="sx-scripture-window" tabIndex={0} role="region" aria-label="經文，可暫停閱讀或左右捲動"><span className="sx-scripture-track" aria-hidden="true">{[0, 1].map(copy => <span className="sx-scripture-copy" key={copy}>{verse}<cite><span className="sx-scripture-separator" />詩篇 15:2</cite></span>)}</span></span>
  </blockquote>;
}

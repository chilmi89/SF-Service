"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import { Heart, Eye, ArrowUpRight } from 'lucide-react';

const useMedia = (queries, values, defaultValue) => {
  const get = () => {
    if (typeof window === 'undefined') return defaultValue;
    return values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  };

  const [value, setValue] = useState(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
  }, [queries]);

  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

const preloadImages = async urls => {
  if (typeof window === 'undefined') return;
  await Promise.all(
    urls.map(
      src =>
        new Promise(resolve => {
          const img = new window.Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.98,
  blurToFocus = true,
}) => {
  const columns = useMedia(
    ['(min-width:1600px)', '(min-width:1200px)', '(min-width:900px)', '(min-width:600px)', '(min-width:400px)'],
    [6, 5, 4, 2, 1],
    1
  );

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);

  const getInitialPosition = item => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'];
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 };
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 };
      case 'left':
        return { x: -200, y: item.y };
      case 'right':
        return { x: window.innerWidth + 200, y: item.y };
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    preloadImages(items.map(i => i.img)).then(() => setImagesReady(true));
  }, [items]);

  const grid = useMemo(() => {
    if (!width) return { grid: [], maxHeight: 0 };
    const colHeights = new Array(columns).fill(0);
    const gap = 16; 
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    const calculatedGrid = items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      
      const totalHeight = (child.height || 400) * (columnWidth / 350);
      const imageHeight = totalHeight; 
      
      const y = colHeights[col];
      colHeights[col] += totalHeight + gap;
      
      return { ...child, x, y, w: columnWidth, h: totalHeight, imageHeight };
    });

    return { 
      grid: calculatedGrid,
      maxHeight: Math.max(...colHeights)
    };
  }, [columns, items, width]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady) return;

    grid.grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const start = getInitialPosition(item);
        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus && { filter: 'blur(10px)' })
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: 'blur(0px)' }),
            duration: 0.8,
            ease: 'power3.out',
            delay: index * stagger,
            onComplete: () => {
              // Staggered reveal for metadata
              gsap.fromTo(
                `${selector} .animate-meta`,
                { opacity: 0, y: 10 },
                { 
                  opacity: 1, 
                  y: 0, 
                  stagger: 0.1, 
                  duration: 0.4, 
                  ease: 'back.out(1.7)' 
                }
              );
            }
          }
        );
      } else {
        gsap.to(selector, {
          ...animProps,
          duration,
          ease,
          overwrite: 'auto'
        });
      }
    });

    if (grid.grid.length > 0) hasMounted.current = true;
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease]);

  const handleMouseEnter = (id) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: hoverScale,
        duration: 0.4,
        ease: 'power2.out'
      });
      
      // Animate metadata on hover
      gsap.to(`[data-key="${id}"] .meta-name`, { 
        x: 2, 
        color: '#000',
        duration: 0.3 
      });
      
      gsap.to(`[data-key="${id}"] .meta-badge`, { 
        backgroundColor: '#000',
        scale: 1.1,
        duration: 0.3,
        ease: 'back.out(2)'
      });
      
      gsap.to(`[data-key="${id}"] .meta-heart`, { 
        scale: 1.1,
        y: -2,
        duration: 0.3,
        ease: 'back.out(2)'
      });
    }
  };

  const handleMouseLeave = (id) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });

      gsap.to(`[data-key="${id}"] .meta-name`, { x: 0, duration: 0.3 });
      gsap.to(`[data-key="${id}"] .meta-badge`, { scale: 1, duration: 0.3 });
      gsap.to(`[data-key="${id}"] .meta-heart`, { scale: 1, y: 0, duration: 0.3 });
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full transition-all duration-500" 
      style={{ height: grid.maxHeight || 800 }}
    >
      {grid.grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="absolute group"
          style={{ willChange: 'transform, width, height, opacity' }}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={() => handleMouseLeave(item.id)}
        >
          {/* Main Card Content (Adapted from Home Page) */}
          <div className="flex flex-col h-full transition-transform duration-500">
            {/* Image Container & Overlay Content */}
            <div 
              className="relative overflow-hidden rounded-2xl border border-black/[0.05] bg-gray-50 transition-all duration-500"
              style={{ height: item.imageHeight }}
            >
              <Image 
                src={item.img} 
                alt={item.title} 
                fill 
                className="object-cover grayscale transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between p-5 text-white">
                <div className="flex items-center justify-between transform translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-500 delay-75">
                  <span className="text-sm font-bold truncate pr-4">{item.title}</span>
                  <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between transform translate-y-[10px] group-hover:translate-y-0 transition-transform duration-500 delay-100">
                  <div className="flex items-center gap-2">
                    <div className="relative h-7 w-7 overflow-hidden rounded-full border border-white/20">
                      <Image src={item.avatar} alt={item.tech} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold leading-tight">{item.tech.split(' ')[0]}</span>
                      <span className="text-[8px] font-black text-white/60 uppercase tracking-tighter">PRO MEMBER</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 cursor-pointer group/heart">
                      <Heart className="h-4 w-4 fill-white group-hover/heart:fill-red-500 group-hover/heart:text-red-500 transition-colors" />
                      <span className="text-xs font-bold">{item.likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs font-bold">{item.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;

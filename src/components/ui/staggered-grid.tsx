"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import imagesLoaded from "imagesloaded";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export interface BentoItem {
  id: number | string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  content?: React.ReactNode;
  image?: string;
  slug?: string;
}

export interface GridImageItem {
  url: string;
  slug?: string;
}

export interface StaggeredGridProps {
  images: string[];
  gridItems?: GridImageItem[];
  bentoItems: BentoItem[];
  centerText?: string;
  credits?: {
    madeBy: { text: string; href: string };
    moreDemos: { text: string; href: string };
  };
  className?: string;
  showFooter?: boolean;
}

const PLACEHOLDER_IMG =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%231e293b"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2364748b"%3EArticle%3C/text%3E%3C/svg%3E';

export function StaggeredGrid({
  images,
  gridItems,
  bentoItems,
  centerText = "Latest News",
  credits = {
    madeBy: { text: "transit-track.ai", href: "/" },
    moreDemos: { text: "View all", href: "/reports" },
  },
  className,
  showFooter = false,
}: StaggeredGridProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const gridFullRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [activeBento, setActiveBento] = useState<number>(0);

  const splitText = (text: string) => {
    return text.split("").map((char, i) => (
      <span key={i} className="char inline-block" style={{ willChange: "transform" }}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  useEffect(() => {
    const handleLoad = () => {
      document.body.classList.remove("loading");
      setIsLoaded(true);
    };
    const imgs = document.querySelectorAll(".grid__item-img");
    if (imgs.length > 0) {
      const imgLoad = imagesLoaded(imgs, { background: true }, handleLoad);
      return () => imgLoad.off("always", handleLoad);
    }
    handleLoad();
  }, [images, bentoItems]);

  useEffect(() => {
    if (!isLoaded) return;

    if (textRef.current) {
      const chars = textRef.current.querySelectorAll(".char");
      gsap
        .timeline({
          scrollTrigger: {
            trigger: textRef.current,
            start: "top bottom",
            end: "center center-=25%",
            scrub: 1,
          },
        })
        .from(chars, {
          ease: "sine.out",
          yPercent: 300,
          autoAlpha: 0,
          stagger: { each: 0.05, from: "center" },
        });
    }

    if (gridFullRef.current) {
      const gridFullItems = gridFullRef.current.querySelectorAll(".grid__item");
      const numColumns = getComputedStyle(gridFullRef.current)
        .getPropertyValue("grid-template-columns")
        .split(" ").length;
      const middleColumnIndex = Math.floor(numColumns / 2);

      const columns: Element[][] = Array.from({ length: numColumns }, () => []);
      gridFullItems.forEach((item: Element, index: number) => {
        columns[index % numColumns].push(item);
      });

      columns.forEach((columnItems, columnIndex) => {
        const delayFactor = Math.abs(columnIndex - middleColumnIndex) * 0.2;
        gsap
          .timeline({
            scrollTrigger: {
              trigger: gridFullRef.current,
              start: "top bottom",
              end: "center center",
              scrub: 1.5,
            },
          })
          .from(
            columnItems,
            {
              yPercent: 450,
              autoAlpha: 0,
              delay: delayFactor,
              ease: "sine.out",
            },
            0
          )
          .from(
            columnItems.map((item) => item.querySelector(".grid__item-img")),
            {
              transformOrigin: "50% 0%",
              ease: "sine.out",
            },
            0
          );
      });

      const bentoContainer = gridFullRef.current.querySelector(".bento-container");
      if (bentoContainer) {
        gsap.timeline({
          scrollTrigger: {
            trigger: gridFullRef.current,
            start: "top top+=15%",
            end: "bottom center",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }).to(
          bentoContainer,
          {
            y: window.innerHeight * 0.1,
            scale: 1.5,
            zIndex: 1000,
            ease: "power2.out",
            duration: 1,
            force3D: true,
          },
          0
        );
      }
    }
  }, [isLoaded]);

  const imageSources =
    gridItems && gridItems.length > 0
      ? gridItems
      : images.length > 0
        ? images.map((url) => ({ url, slug: undefined as string | undefined }))
        : [{ url: PLACEHOLDER_IMG, slug: undefined as string | undefined }];
  const mixedGridItems: (GridImageItem | "BENTO_GROUP")[] = [
    ...imageSources,
    ...imageSources,
    imageSources[0] || { url: PLACEHOLDER_IMG, slug: undefined },
  ].slice(0, 35);
  mixedGridItems[16] = "BENTO_GROUP";

  return (
    <div
      className={cn("shadow relative overflow-hidden w-full", className)}
      style={{ "--grid-item-translate": "0px" } as React.CSSProperties}
    >
      <section className="grid place-items-center w-full relative mt-[10vh]">
        <div
          ref={textRef}
          className="font-alt uppercase flex content-center text-[clamp(3rem,14vw,10rem)] leading-[0.7] text-foreground"
        >
          {splitText(centerText)}
        </div>
      </section>

      <section className="grid place-items-center w-full relative">
        <div
          ref={gridFullRef}
          className="grid--full relative w-full my-[10vh] h-auto aspect-[1.1] max-w-none p-4 grid gap-4 grid-cols-7 grid-rows-5"
        >
          <div className="grid-overlay absolute inset-0 z-[15] pointer-events-none opacity-0 bg-background/80 rounded-lg transition-opacity duration-500" />
          {mixedGridItems.map((item, i) => {
            if (item === "BENTO_GROUP") {
              if (!bentoItems || bentoItems.length === 0) return null;
              return (
                <div
                  key="bento-group"
                  className="grid__item bento-container col-span-3 row-span-1 relative z-20 flex items-center justify-center gap-2 h-full w-full will-change-transform"
                >
                  {bentoItems.map((bentoItem, index) => {
                    const isActive = activeBento === index;
                    const Wrapper = bentoItem.slug ? Link : "div";
                    const wrapperProps = bentoItem.slug ? { to: `/article/${bentoItem.slug}` } : {};
                    return (
                      <Wrapper
                        key={bentoItem.id}
                        {...wrapperProps}
                        className={cn(
                          "relative cursor-pointer overflow-hidden rounded-2xl h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]",
                          isActive ? "bg-zinc-900/10 dark:bg-zinc-900/30 shadow-2xl" : "bg-zinc-950 dark:bg-zinc-900"
                        )}
                        style={{ width: isActive ? "60%" : "20%" }}
                        onMouseEnter={() => setActiveBento(index)}
                        onClick={() => setActiveBento(index)}
                      >
                        <div
                          className={cn(
                            "absolute inset-0 rounded-2xl border z-50 pointer-events-none transition-colors duration-700",
                            isActive ? "border-zinc-500/50" : "border-zinc-800/50"
                          )}
                        />
                        <div className="relative z-10 w-full h-full flex flex-col p-0">
                          <div
                            className={cn(
                              "absolute inset-0 flex flex-col transition-all duration-500 ease-in-out",
                              isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                            )}
                          >
                            <div className="absolute inset-0 bg-zinc-900 overflow-hidden z-0">
                              {bentoItem.image && (
                                <>
                                  <img
                                    src={bentoItem.image}
                                    alt={bentoItem.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 opacity-90"
                                  />
                                  <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
                                </>
                              )}
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-20 flex items-center justify-between px-5 z-20">
                              <h3 className="text-sm font-bold text-white drop-shadow-md">{bentoItem.title}</h3>
                              <div className="text-white/90">{bentoItem.icon}</div>
                            </div>
                          </div>
                        </div>
                        <div
                          className={cn(
                            "absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all duration-500",
                            isActive ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
                          )}
                        >
                          <div className="text-white/50">{bentoItem.icon}</div>
                          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                            {bentoItem.title}
                          </span>
                        </div>
                      </Wrapper>
                    );
                  })}
                </div>
              );
            }
            if (i === 17 || i === 18) return null;
            const gridItem = typeof item === "string" ? { url: item || PLACEHOLDER_IMG, slug: undefined } : item;
            if (gridItem && "url" in gridItem) {
              const imgSrc = gridItem.url || PLACEHOLDER_IMG;
              const linkTo = gridItem.slug ? `/article/${gridItem.slug}` : "/reports";
              return (
                <div
                  key={`img-${i}`}
                  className="grid__item m-0 relative z-10 [perspective:800px] will-change-[transform,opacity] group cursor-pointer"
                >
                  <Link
                    to={linkTo}
                    className="grid__item-img w-full h-full [backface-visibility:hidden] will-change-transform rounded-xl overflow-hidden shadow-sm border border-border bg-muted flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-xl"
                  >
                    <img
                      src={imgSrc}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMG;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                    <div className="relative z-10 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FileText className="w-8 h-8 text-white/90 group-hover:scale-110 transition-transform" />
                      <span className="block text-sm font-bold text-white tracking-tight">Read</span>
                    </div>
                  </Link>
                </div>
              );
            }
            return null;
          })}
        </div>
      </section>

      {showFooter && (
        <footer className="frame__footer w-full p-8 flex justify-between items-center relative z-50 text-foreground uppercase font-medium text-xs tracking-wider">
          <Link to={credits.madeBy.href} className="hover:opacity-60 transition-opacity">
            {credits.madeBy.text}
          </Link>
          <Link to={credits.moreDemos.href} className="hover:opacity-60 transition-opacity">
            {credits.moreDemos.text}
          </Link>
        </footer>
      )}
    </div>
  );
}

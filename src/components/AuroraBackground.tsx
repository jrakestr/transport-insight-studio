"use client";

import { useEffect, useState } from "react";

const auroraGradient = `
  repeating-linear-gradient(
    100deg,
    var(--stripe-color) 0%,
    var(--stripe-color) 7%,
    transparent 10%,
    transparent 12%,
    var(--stripe-color) 16%
  ),
  repeating-linear-gradient(
    100deg,
    hsl(var(--aurora-1)) 10%,
    hsl(var(--aurora-2)) 15%,
    hsl(var(--aurora-1)) 20%,
    hsl(var(--aurora-3)) 25%,
    hsl(var(--aurora-1)) 30%
  )
`;

export function AuroraBackground() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkDarkMode = () =>
      document.documentElement.classList.contains("dark");
    setIsDark(checkDarkMode());

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDark(checkDarkMode());
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return null;
  }

  const filter = isDark
    ? "blur(10px) opacity(0.5) saturate(2)"
    : "blur(10px) opacity(0.4) saturate(1.5)";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden"
      style={{
        backgroundImage: auroraGradient,
        backgroundSize: "300%, 200%",
        backgroundPosition: "50% 50%, 50% 50%",
        filter,
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 70%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 70%)",
      }}
    >
      <div
        className="absolute inset-0 animate-aurora-bg will-change-[background-position]"
        style={{
          backgroundImage: auroraGradient,
          backgroundSize: "400%, 200%",
          mixBlendMode: "difference",
        }}
      />
    </div>
  );
}

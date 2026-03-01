"use client";

import React from "react";
import { motion, type MotionProps } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

type AnimatedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  MotionProps & {
    children?: React.ReactNode;
    asChild?: boolean;
    as?: React.ElementType;
    size?: "default" | "sm" | "lg";
  };

const sizeClasses = {
  default: "px-6 py-2",
  sm: "px-4 py-1.5 text-sm",
  lg: "px-8 py-3 text-base",
};

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children = "Browse Components",
  className = "",
  as = "button",
  asChild = false,
  size = "default",
  whileTap = { scale: 0.97 },
  transition = {
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 10,
      damping: 5,
      mass: 0.1,
    },
  },
  ...rest
}) => {
  const baseClasses = cn(
    "rounded-md relative overflow-hidden bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-800",
    sizeClasses[size],
    "text-neutral-900 dark:text-neutral-100 [--shine:rgba(0,0,0,.66)] dark:[--shine:rgba(255,255,255,.66)]",
    "inline-flex items-center justify-center gap-2 font-medium",
    className
  );

  const content = asChild && React.isValidElement(children)
    ? (children as React.ReactElement).props.children
    : children;

  const motionSpanContent = (
    <motion.span
      className="tracking-wide font-light h-full w-full flex items-center justify-center relative z-10"
      style={{
        WebkitMaskImage:
          "linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))",
        maskImage:
          "linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))",
      }}
      initial={{ ["--mask-x" as string]: "100%" }}
      animate={{ ["--mask-x" as string]: "-100%" }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear", repeatDelay: 1 }}
    >
      {content}
    </motion.span>
  );

  const motionSpanBorder = (
    <motion.span
      className="block absolute inset-0 rounded-md p-px"
      style={{
        background: "linear-gradient(-75deg, transparent 30%, var(--shine) 50%, transparent 70%)",
        backgroundSize: "200% 100%",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
      }}
      initial={{ backgroundPosition: "100% 0", opacity: 0 }}
      animate={{ backgroundPosition: ["100% 0", "0% 0"], opacity: [0, 1, 0] }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
    />
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ to: string; className?: string }>;
    if (child.type === Link) {
      const { className: childClassName, ...linkProps } = child.props;
      return (
        <MotionLink
          {...linkProps}
          {...(rest as object)}
          whileTap={whileTap}
          transition={transition}
          className={cn(baseClasses, childClassName)}
        >
          {motionSpanContent}
          {motionSpanBorder}
        </MotionLink>
      );
    }
  }

  const Component = (motion as unknown as Record<string, React.ElementType>)[as] || motion.button;

  return (
    <Component
      {...rest}
      whileTap={whileTap}
      transition={transition}
      className={baseClasses}
    >
      {motionSpanContent}
      {motionSpanBorder}
    </Component>
  );
};

export default AnimatedButton;

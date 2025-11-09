import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GradientCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "calm" | "warm";
}

export const GradientCard = ({ children, className, variant = "default" }: GradientCardProps) => {
  const gradientClass = {
    default: "bg-card",
    calm: "bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10",
    warm: "bg-gradient-to-br from-secondary/20 to-accent/20"
  }[variant];

  return (
    <div 
      className={cn(
        "rounded-[2rem] p-6 shadow-[0_4px_20px_hsl(var(--primary)/0.08)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_8px_32px_hsl(var(--primary)/0.12)]",
        gradientClass,
        className
      )}
    >
      {children}
    </div>
  );
};

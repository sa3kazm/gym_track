"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  emoji?: string;
}

export function OptionCard({
  selected,
  onClick,
  title,
  description,
  emoji,
}: OptionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary))]"
          : "border-border bg-card/50 hover:border-primary/40 hover:bg-card"
      )}
    >
      {emoji && <span className="text-2xl">{emoji}</span>}
      <span className="flex flex-col gap-0.5">
        <span className="font-medium">{title}</span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </span>
    </motion.button>
  );
}

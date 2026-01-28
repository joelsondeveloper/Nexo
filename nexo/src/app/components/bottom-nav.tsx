"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface NavItem {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

interface BottomNavProps {
  items: NavItem[];
  onItemClick?: (index: number) => void;
}

export function BottomNav({ items, onItemClick }: BottomNavProps) {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="sticky bottom-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-lg border-t border-border-subtle pb-safe h-fit"
    >
      <div className="max-w-125 mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => onItemClick?.(index)}
                className={`flex flex-col items-center gap-1 min-w-16 transition-all relative ${
                  item.active ? "text-primary" : "text-text-muted"
                }`}
              >
                {/* Indicador de Aba Ativa (Pílula superior) */}
                {item.active && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -top-3 w-8 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  className={`p-1 rounded-lg ${item.active ? "bg-primary-soft/30" : ""}`}
                >
                  <Icon
                    size={24}
                    strokeWidth={item.active ? 2.5 : 2}
                  />
                </motion.div>
                
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  item.active ? "opacity-100" : "opacity-60"
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
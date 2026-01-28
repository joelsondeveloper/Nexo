"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FinancialCardProps {
  label: string;
  amount: number;
  icon: LucideIcon;
  variant?: "income" | "expense" | "balance";
  delay?: number;
}

export function FinancialCard({ 
  label, 
  amount, 
  icon: Icon, 
  variant = "balance",
  delay = 0 
}: FinancialCardProps) {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getVariantColor = () => {
    switch (variant) {
      case "income": return "text-income";
      case "expense": return "text-expense";
      default: return "text-primary";
    }
  };

  const getBgIconColor = () => {
    switch (variant) {
      case "income": return "bg-income/10 text-income";
      case "expense": return "bg-expense/10 text-expense";
      default: return "bg-primary-soft text-primary";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="bg-surface rounded-xl p-5 shadow-sm border border-border-subtle"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <div className={`p-2 rounded-lg ${getBgIconColor()}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>

      <div className="space-y-1">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className={`text-2xl font-bold tracking-tight ${getVariantColor()}`}
        >
          {formatCurrency(amount)}
        </motion.p>
      </div>
    </motion.div>
  );
}
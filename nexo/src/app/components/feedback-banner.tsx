"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  X,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

interface FeedbackBannerProps {
  tipo: "sucesso" | "alerta" | "info";
  mensagem: string;
  onClose: () => void;
}

interface FeedbackConfig {
  icon: LucideIcon;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
}

export function FeedbackBanner({
  tipo,
  mensagem,
  onClose,
}: FeedbackBannerProps) {
  const getConfig = (): FeedbackConfig => {
    switch (tipo) {
      case "sucesso":
        return {
          icon: CheckCircle,
          bgColor: "bg-success/10",
          borderColor: "border-success/20",
          textColor: "text-success",
          accentColor: "bg-success",
        };

      case "alerta":
        return {
          icon: AlertCircle,
          bgColor: "bg-warning/10",
          borderColor: "border-warning/20",
          textColor: "text-warning",
          accentColor: "bg-warning",
        };

      default:
        return {
          icon: Sparkles,
          bgColor: "bg-primary/10",
          borderColor: "border-primary/20",
          textColor: "text-primary",
          accentColor: "bg-primary",
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        key="feedback-banner"
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        className={`${config.bgColor} border ${config.borderColor} rounded-2xl p-4 relative overflow-hidden`}
      >
        {/* Barra lateral */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${config.accentColor}`}
        />

        <div className="flex items-start gap-3">
          <div className={`${config.textColor} mt-0.5`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>

          <div className="flex-1">
            <p
              className={`text-sm font-medium leading-tight ${config.textColor}`}
            >
              {mensagem}
            </p>
          </div>

          <button
            onClick={onClose}
            className={`${config.textColor} opacity-50 hover:opacity-100 transition-opacity p-1`}
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

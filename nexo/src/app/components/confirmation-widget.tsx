"use client";

import { motion } from "framer-motion";
import { CheckCircle, Undo2, Tag } from "lucide-react";

interface ConfirmacaoWidgetProps {
  tipo: "income" | "expense";
  descricao: string;
  valor: number;
  categoria?: string;
  onDesfazer?: () => void;
}

export function ConfirmacaoWidget({
  tipo,
  descricao,
  valor,
  categoria,
  onDesfazer,
}: ConfirmacaoWidgetProps) {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const isIncome = tipo === "income";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`rounded-2xl p-4 border-2 mt-2 shadow-sm ${
        isIncome
          ? "bg-income/5 border-income/20"
          : "bg-expense/5 border-expense/20"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Ícone de Status */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className={`p-2 rounded-xl shrink-0 ${
            isIncome ? "bg-income/20 text-income" : "bg-expense/20 text-expense"
          }`}
        >
          <CheckCircle size={20} strokeWidth={2.5} />
        </motion.div>

        {/* Detalhes do Registro */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">
                {isIncome ? "Entrada Salva" : "Saída Salva"}
              </p>
              <p className="text-sm font-bold text-text-primary truncate">
                {descricao}
              </p>
            </div>
          </div>

          {/* Categoria Tag */}
          {categoria && (
            <div className="flex items-center gap-1 mt-1">
              <Tag size={10} className="text-text-muted" />
              <span className="text-[10px] font-medium text-text-muted uppercase">
                {categoria}
              </span>
            </div>
          )}

          {/* Valor de Destaque */}
          <p className={`text-xl font-black mt-2 tracking-tight ${
              isIncome ? "text-income" : "text-expense"
            }`}
          >
            {isIncome ? "+" : "-"} {formatCurrency(valor)}
          </p>
        </div>
      </div>

      {/* Ação de Desfazer */}
      {onDesfazer && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDesfazer}
          className="w-full mt-4 py-2.5 rounded-xl bg-surface border border-border-subtle text-text-secondary text-xs font-bold flex items-center justify-center gap-2 hover:bg-background-secondary transition-all"
        >
          <Undo2 size={14} strokeWidth={3} />
          Desfazer Registro
        </motion.button>
      )}
    </motion.div>
  );
}
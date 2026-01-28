"use client";

import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Transaction {
  id: string;
  tipo: "income" | "expense";
  descricao: string;
  valor: number;
  data: string;
  categoria?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Ex: "24 de jan."
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-surface rounded-xl p-8 text-center border border-dashed border-border-subtle"
      >
        <p className="text-text-muted">Nenhuma movimentação registrada</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.2,
              delay: index * 0.03,
            }}
            className="bg-surface rounded-xl p-4 border border-border-subtle flex items-center gap-4 hover:border-primary/20 transition-colors"
          >
            {/* Ícone Indicador */}
            <div
              className={`p-2 rounded-lg shrink-0 ${
                transaction.tipo === "income"
                  ? "bg-income/10 text-income"
                  : "bg-expense/10 text-expense"
              }`}
            >
              {transaction.tipo === "income" ? (
                <ArrowUpCircle size={20} strokeWidth={2.5} />
              ) : (
                <ArrowDownCircle size={20} strokeWidth={2.5} />
              )}
            </div>

            {/* Descrição e Data */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate uppercase tracking-wide">
                {transaction.descricao}
              </p>
              <p className="text-xs text-text-muted">
                {formatDate(transaction.data)}
                {transaction.categoria && (
                  <span className="capitalize"> • {transaction.categoria}</span>
                )}
              </p>
            </div>

            {/* Valor */}
            <div className="text-right">
              <p
                className={`text-sm font-bold ${
                  transaction.tipo === "income" ? "text-income" : "text-expense"
                }`}
              >
                {transaction.tipo === "income" ? "+" : "-"}
                {formatCurrency(transaction.valor)}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
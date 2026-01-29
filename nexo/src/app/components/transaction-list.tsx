"use client";

import { ArrowDownCircle, ArrowUpCircle, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNexoStore, Movimentacao } from "../store/nexo-store";

interface TransactionListProps {
  transactions: Movimentacao[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  // Pegamos as ações necessárias da Store
  const { removerMovimentacao, setTransacaoParaEditar, abrirModal } = useNexoStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    // Garantir que a data seja tratada corretamente independente do fuso horário
    const date = new Date(dateString + "T12:00:00");
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
        <p className="text-text-muted text-sm font-medium">
          Nenhuma movimentação registrada
        </p>
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
            transition={{ duration: 0.2, delay: index * 0.02 }}
            className="group bg-surface rounded-xl p-4 border border-border-subtle flex items-center gap-4 transition-all hover:border-primary/20"
          >
            {/* Ícone Indicador (Entrada/Saída) */}
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

            {/* Detalhes: Descrição e Data */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate uppercase tracking-wide">
                {transaction.descricao}
              </p>
              <p className="text-xs text-text-muted font-medium">
                {formatDate(transaction.data)}
                {transaction.categoria && (
                  <span className="opacity-60"> • {transaction.categoria}</span>
                )}
              </p>
            </div>

            {/* Valor e Ações */}
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-bold whitespace-nowrap ${
                  transaction.tipo === "income" ? "text-income" : "text-expense"
                }`}
              >
                {transaction.tipo === "income" ? "+" : "-"}
                {formatCurrency(transaction.valor)}
              </p>

              {/* Botões de Ação */}
              <div className="flex items-center ml-2 border-l border-border-subtle pl-2">
                {/* Botão Editar */}
                <button
                  onClick={() => {
                    setTransacaoParaEditar(transaction); // Define qual transação será editada
                    abrirModal(); // Abre o modal (que agora estará em modo edição)
                  }}
                  className="p-1.5 text-text-muted hover:text-primary transition-colors rounded-md hover:bg-primary/5"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>

                {/* Botão Excluir */}
                <button
                  onClick={() => {
                    if (confirm("Deseja realmente excluir este registro?")) {
                      removerMovimentacao(transaction.id);
                    }
                  }}
                  className="p-1.5 text-text-muted hover:text-error transition-colors rounded-md hover:bg-error/5"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
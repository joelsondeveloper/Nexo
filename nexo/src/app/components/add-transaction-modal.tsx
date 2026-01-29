"use client";

import { useState, useEffect } from "react";
import {
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Tag,
  AlignLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNexoStore } from "../store/nexo-store";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: {
    tipo: "income" | "expense";
    descricao: string;
    valor: number;
    data: string;
    categoria: string;
  }) => void;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onAdd,
}: AddTransactionModalProps) {
  const [tipo, setTipo] = useState<"income" | "expense">("income");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [categoria, setCategoria] = useState("");

  const {
    transacaoParaEditar,
    setTransacaoParaEditar,
    editarMovimentacao,
    adicionarMovimentacao,
  } = useNexoStore();

  useEffect(() => {
    if (transacaoParaEditar) {
      setTipo(transacaoParaEditar.tipo);
      setDescricao(transacaoParaEditar.descricao);
      setValor(transacaoParaEditar.valor.toString());
      setCategoria(transacaoParaEditar.categoria);
      setData(transacaoParaEditar.data);
    } else {
      // Reset para modo "Novo"
      setTipo("income");
      setDescricao("");
      setValor("");
      setCategoria("");
      setData(new Date().toISOString().split("T")[0]);
    }
  }, [transacaoParaEditar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dados = {
      tipo,
      descricao,
      valor: parseFloat(valor),
      categoria,
      data,
    };

    if (transacaoParaEditar) {
      await editarMovimentacao(transacaoParaEditar.id, dados);
    } else {
      await adicionarMovimentacao(dados);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative bg-surface w-full max-w-125 rounded-t-4xl sm:rounded-2xl p-6 shadow-xl overflow-hidden"
          >
            {/* Handle visual para mobile */}
            <div className="w-12 h-1.5 bg-border-subtle rounded-full mx-auto mb-6 sm:hidden" />

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                {transacaoParaEditar ? "Editar Registro" : "Novo Registro"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-text-muted hover:bg-background-secondary rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Seletor de Tipo (Income/Expense) */}
              <div className="flex p-1 bg-background-secondary rounded-xl">
                <button
                  type="button"
                  onClick={() => setTipo("income")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                    tipo === "income"
                      ? "bg-surface text-income shadow-sm"
                      : "text-text-muted"
                  }`}
                >
                  <ArrowUpCircle size={20} /> Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setTipo("expense")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                    tipo === "expense"
                      ? "bg-surface text-expense shadow-sm"
                      : "text-text-muted"
                  }`}
                >
                  <ArrowDownCircle size={20} /> Saída
                </button>
              </div>

              {/* Valor (Destaque) */}
              <div className="relative">
                <label className="text-xs font-bold text-text-muted uppercase ml-1">
                  Valor
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-text-muted">
                    R$
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    placeholder="0,00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-background-secondary border-2 border-transparent focus:border-primary focus:bg-surface rounded-2xl text-3xl font-bold text-text-primary transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase ml-1 flex items-center gap-1">
                  <AlignLeft size={14} /> Descrição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Venda de Bolo de Pote"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-4 py-3 bg-background-secondary border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>

              {/* Grid Categoria e Data */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase ml-1 flex items-center gap-1">
                    <Tag size={14} /> Categoria
                  </label>
                  <input
                    type="text"
                    placeholder="Vendas"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-4 py-3 bg-background-secondary border border-border-subtle rounded-xl text-sm outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase ml-1 flex items-center gap-1">
                    <Calendar size={14} /> Data
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full px-4 py-3 bg-background-secondary border border-border-subtle rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all mt-4"
              >
                Salvar Movimentação
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

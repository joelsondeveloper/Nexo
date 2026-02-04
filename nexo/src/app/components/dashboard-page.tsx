"use client";

import { useState, useEffect } from "react";
import { useNexoStore, Movimentacao } from "../store/nexo-store";
import { signOut } from "next-auth/react";
import { FinancialCard } from "./financial-card";
import { BottomNav } from "./bottom-nav";
import { TransactionList } from "./transaction-list";
import { AddTransactionModal } from "./add-transaction-modal";
import { ReportsView } from "./reports-view";
import { FeedbackBanner } from "./feedback-banner";
import { ChatPage } from "./chat-page";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  LayoutDashboard,
  Receipt,
  BarChart3,
  Settings,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";

interface DashboardPageProps {
  user: any;
  initialData?: Movimentacao[];
}

export function DashboardPage({ user, initialData }: DashboardPageProps) {
  const {
    tema,
    abaAtiva,
    modalAberto,
    movimentacoes,
    dadosMensais,
    feedback,
    alternarTema,
    setAbaAtiva,
    abrirModal,
    fecharModal,
    adicionarMovimentacao,
    gerarFeedbackInteligente,
    limparFeedback,
    setMovimentacoes,
  } = useNexoStore();

  const [mostrarChat, setMostrarChat] = useState(false);

  // 1. CORREÇÃO: Sincroniza o tema com o HTML (Persistência ao recarregar)
  useEffect(() => {
    const root = window.document.documentElement;
    if (tema === "escuro") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [tema]);

  // Sincroniza dados do servidor com a Store local
  useEffect(() => {
    if (initialData) {
      setMovimentacoes(initialData);
    }
  }, [initialData, setMovimentacoes]);

  // Atualiza os insights da IA sempre que houver novas movimentações
  useEffect(() => {
    gerarFeedbackInteligente();
  }, [gerarFeedbackInteligente, movimentacoes]);

  // Se o modo chat estiver ativo, renderizamos apenas a tela de conversa
  if (mostrarChat) {
    return <ChatPage onVoltar={() => setMostrarChat(false)} user={user} />;
  }

  // Cálculos de Saldo
  const totalEntradas = movimentacoes
    .filter((m) => m.tipo === "income")
    .reduce((sum, m) => sum + m.valor, 0);

  const totalSaidas = movimentacoes
    .filter((m) => m.tipo === "expense")
    .reduce((sum, m) => sum + m.valor, 0);

  const saldo = totalEntradas - totalSaidas;

  const navItems = [
    { label: "Início", icon: LayoutDashboard, active: abaAtiva === 0 },
    { label: "Movimentos", icon: Receipt, active: abaAtiva === 1 },
    { label: "Relatórios", icon: BarChart3, active: abaAtiva === 2 },
    { label: "Ajustes", icon: Settings, active: abaAtiva === 3 },
  ];

  return (
    <div className="min-h-screen bg-background-primary relative transition-colors duration-300 flex flex-col">
      {/* Header Fixo - Ajustado max-w-125 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border-b border-border-subtle sticky top-0 z-30"
      >
        <div className="max-w-125 mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "Perfil"}
                width={32}
                height={32}
                className="rounded-full border border-primary/20"
              />
            ) : (
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <UserIcon size={16} />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold tracking-tight text-text-primary leading-none">
                NEXO
              </h1>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                Olá, {user?.name?.split(" ")[0]}
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={alternarTema}
            className="p-2.5 rounded-xl bg-background-secondary text-text-muted"
          >
            {tema === "escuro" ? (
              <Sun size={20} className="text-warning" />
            ) : (
              <Moon size={20} />
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Conteúdo Principal - Ajustado max-w-125 */}
      <main className="max-w-125 mx-auto px-6 py-6 flex-1">
        <AnimatePresence mode="wait">
          {/* ABA 0: DASHBOARD PRINCIPAL */}
          {abaAtiva === 0 && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-text-primary">
                  Bem-vindo!
                </h2>
                <p className="text-sm text-text-secondary">
                  Seu resumo financeiro hoje
                </p>
              </div>

              {feedback && (
                <FeedbackBanner
                  tipo={feedback.tipo}
                  mensagem={feedback.mensagem}
                  onClose={limparFeedback}
                />
              )}

              <div className="space-y-4">
                <FinancialCard
                  label="Entradas"
                  amount={totalEntradas}
                  icon={TrendingUp}
                  variant="income"
                />
                <FinancialCard
                  label="Saídas"
                  amount={totalSaidas}
                  icon={TrendingDown}
                  variant="expense"
                />
                <FinancialCard
                  label="Saldo atual"
                  amount={saldo}
                  icon={Wallet}
                  variant="balance"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={abrirModal}
                className="w-full bg-primary hover:bg-primary-hover text-white rounded-2xl py-4 font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <Plus size={24} strokeWidth={3} /> Adicionar movimento
              </motion.button>

              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-text-primary">
                    Recentes
                  </h3>
                  <button
                    onClick={() => setAbaAtiva(1)}
                    className="text-xs font-bold text-primary uppercase"
                  >
                    Ver tudo
                  </button>
                </div>
                <TransactionList transactions={movimentacoes.slice(0, 5)} />
              </section>
            </motion.div>
          )}

          {/* ABA 1: MOVIMENTAÇÕES COMPLETA */}
          {abaAtiva === 1 && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-text-primary">
                Movimentações
              </h2>
              <TransactionList transactions={movimentacoes} />
            </motion.div>
          )}

          {/* ABA 2: RELATÓRIOS */}
          {abaAtiva === 2 && (
            <motion.div
              key="reports"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-text-primary">
                Relatórios
              </h2>
              <ReportsView dadosMensais={dadosMensais} />
            </motion.div>
          )}

          {/* ABA 3: AJUSTES */}
          {abaAtiva === 3 && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-text-primary">Ajustes</h2>
              <div className="space-y-3">
                <div className="bg-surface border border-border-subtle rounded-2xl p-5 flex items-center gap-4">
                  {user?.image && (
                    <Image
                      src={user.image}
                      className="w-12 h-12 rounded-full"
                      width={48}
                      height={48}
                      alt=""
                    />
                  )}
                  <div>
                    <p className="font-bold text-text-primary leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full bg-error/10 text-error rounded-2xl p-5 font-bold flex items-center justify-center gap-2 hover:bg-error/20 transition-all"
                >
                  <LogOut size={20} /> Sair da conta
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Botão Flutuante IA - CORREÇÃO: z-50 para ficar sobre o menu */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6, ease: "backOut" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setMostrarChat(true)}
        className="fixed bottom-28 right-6 w-16 h-16 bg-linear-to-br from-primary to-primary-hover rounded-full shadow-2xl flex items-center justify-center z-50"
        style={{ boxShadow: "0 8px 32px rgba(2, 132, 199, 0.4)" }}
      >
        <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />

        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-primary"
        />
      </motion.button>

      {/* Navegação Inferior - z-40 para ficar abaixo da IA */}
      <BottomNav items={navItems} onItemClick={setAbaAtiva} />

      {/* Modal de Cadastro/Edição */}
      <AddTransactionModal
        isOpen={modalAberto}
        onClose={fecharModal}
        onAdd={adicionarMovimentacao}
      />
    </div>
  );
}
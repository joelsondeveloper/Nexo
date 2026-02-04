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
import { deleteAccountAction } from "../actions/user-actions";
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
  ChevronRight,
  ShieldAlert,
  Trash2,
  Info,
} from "lucide-react";
import Image from "next/image";
import { PWAInstallBanner } from "./pwa-install-banner";

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

  // Sincroniza o tema com o HTML (Persistência)
  useEffect(() => {
    const root = window.document.documentElement;
    if (tema === "escuro") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [tema]);

  useEffect(() => {
    if (initialData) setMovimentacoes(initialData);
  }, [initialData, setMovimentacoes]);

  useEffect(() => {
    gerarFeedbackInteligente();
  }, [gerarFeedbackInteligente, movimentacoes]);

  if (mostrarChat) {
    return <ChatPage onVoltar={() => setMostrarChat(false)} user={user} />;
  }

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

  const handleExcluirConta = async () => {
    if (
      confirm(
        "TEM CERTEZA? Isso apagará todos os seus dados permanentemente e não pode ser desfeito.",
      )
    ) {
      await deleteAccountAction();
    }
  };

  return (
    <div className="min-h-screen bg-background-primary relative transition-colors duration-300 flex flex-col overflow-x-hidden">
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border-b border-border-subtle fixed top-0 left-0 right-0 z-30"
      >
        <div className="max-w-125 mx-auto px-6 py-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.image ? (
              <Image
                src={user.image}
                alt="Perfil"
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
          <button
            onClick={alternarTema}
            className="p-2.5 rounded-xl bg-background-secondary text-text-muted"
          >
            {tema === "escuro" ? (
              <Sun size={20} className="text-warning" />
            ) : (
              <Moon size={20} />
            )}
          </button>
        </div>
      </motion.header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-125 mx-auto px-6 py-6 pt-20 pb-32 flex-1 w-full">
        <AnimatePresence mode="wait">
          {/* ABA 0: DASHBOARD */}
          {abaAtiva === 0 && (
            <motion.div
              key="dash"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-text-primary">
                  Seu Resumo
                </h2>
                <p className="text-sm text-text-secondary">
                  Visão geral do seu negócio
                </p>
              </div>

              {feedback && (
                <FeedbackBanner
                  tipo={feedback.tipo}
                  mensagem={feedback.mensagem}
                  onClose={limparFeedback}
                />
              )}

              <div className="grid gap-4">
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

              <button
                onClick={abrirModal}
                className="w-full bg-primary hover:bg-primary-hover text-white rounded-2xl py-4 font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <Plus size={24} strokeWidth={3} /> Novo Movimento
              </button>

              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-text-primary">Recentes</h3>
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

          {/* ABA 1: LISTA */}
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
              key="rep"
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

          {/* ABA 3: AJUSTES (CONFIGURAÇÕES COMPLETAS) */}
          {abaAtiva === 3 && (
            <motion.div
              key="set"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-text-primary">Ajustes</h2>

              {/* Card de Perfil */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                {user?.image && (
                  <Image
                    src={user.image}
                    className="w-12 h-12 rounded-full shadow-sm"
                    width={48}
                    height={48}
                    alt=""
                  />
                )}
                <div className="overflow-hidden">
                  <p className="font-bold text-text-primary leading-none truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-text-muted mt-1 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Grupo: Preferências */}
              <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={alternarTema}
                  className="w-full flex items-center justify-between p-5 hover:bg-background-secondary transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary-soft/20 text-primary rounded-lg">
                      {tema === "escuro" ? (
                        <Sun size={20} />
                      ) : (
                        <Moon size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-text-primary text-sm">
                        Tema do App
                      </p>
                      <p className="text-xs text-text-muted capitalize">
                        {tema}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-text-muted" />
                </button>

                <div className="h-[1px] bg-border-subtle mx-5" />

                <div className="p-5 flex items-center gap-4 opacity-50">
                  <div className="p-2 bg-background-secondary text-text-muted rounded-lg">
                    <Info size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary text-sm">
                      Versão do App
                    </p>
                    <p className="text-xs text-text-muted">MVP 1.0.0-beta</p>
                  </div>
                </div>
              </div>

              {/* Grupo: Perigo/Sair */}
              <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-between p-5 hover:bg-background-secondary transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-background-secondary text-text-muted rounded-lg">
                      <LogOut size={20} />
                    </div>
                    <p className="font-bold text-text-primary text-sm">
                      Sair da Conta
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-text-muted" />
                </button>

                <div className="h-[1px] bg-border-subtle mx-5" />

                <button
                  onClick={handleExcluirConta}
                  className="w-full flex items-center justify-between p-5 hover:bg-error/5 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-error/10 text-error rounded-lg">
                      <Trash2 size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-error text-sm">
                        Excluir minha conta
                      </p>
                      <p className="text-[10px] text-error/60 font-medium uppercase tracking-tighter">
                        Ação irreversível
                      </p>
                    </div>
                  </div>
                  <ShieldAlert
                    size={18}
                    className="text-error/40 group-hover:text-error"
                  />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* BOTÃO IA FLUTUANTE - CORREÇÃO: z-50 e bottom maior para não bater no menu */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6, ease: "backOut" }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setMostrarChat(true)}
        className="fixed bottom-28 right-6 w-16 h-16 bg-linear-to-br from-primary to-primary-hover rounded-full shadow-2xl flex items-center justify-center z-50 text-white"
        style={{ boxShadow: "0 8px 32px rgba(2, 132, 199, 0.4)" }}
      >
        <Sparkles className="w-7 h-7" strokeWidth={2.5} />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-primary"
        />
      </motion.button>

      {/* MENU INFERIOR - z-40 */}
      <BottomNav items={navItems} onItemClick={setAbaAtiva} />

      <AddTransactionModal
        isOpen={modalAberto}
        onClose={fecharModal}
        onAdd={adicionarMovimentacao}
      />

      {/* Banner PWA */}
      <PWAInstallBanner />
    </div>
  );
}

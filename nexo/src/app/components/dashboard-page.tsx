"use client";

import { useEffect } from "react";
import { useNexoStore, Movimentacao } from "../store/nexo-store";
import { signOut } from "next-auth/react";
import { FinancialCard } from "./financial-card";
import { BottomNav } from "./bottom-nav";
import { TransactionList } from "./transaction-list";
import { AddTransactionModal } from "./add-transaction-modal";
import { ReportsView } from "./reports-view";
import { FeedbackBanner } from "./feedback-banner";
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
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";

interface DashboardPageProps {
  user: any; // Dados da sessão
  initialData?: Movimentacao[]; // Dados vindos do banco via Server Component
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
    setMovimentacoes
    // Função para hidratar a store com dados do banco (veja nota abaixo)
  } = useNexoStore();

  useEffect(() => {
    if (tema === "escuro") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [tema]);

  // Sincroniza dados do banco com a Store ao carregar
  useEffect(() => {
    if (initialData) {
      setMovimentacoes(initialData);
    }
  }, [initialData, setMovimentacoes]);

  // Atualiza feedback sempre que as movimentações mudarem
  useEffect(() => {
    gerarFeedbackInteligente();
  }, [gerarFeedbackInteligente, movimentacoes]);

  // Cálculos financeiros baseados no estado atual
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
    <div className="min-h-screen bg-background-primary transition-colors duration-300 flex flex-col">
      {/* Header */}
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
                alt={user.name || "Avatar"}
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
            className="p-2.5 rounded-xl bg-background-secondary text-text-muted transition-colors"
          >
            {tema === "escuro" ? (
              <Sun size={20} className="text-warning" />
            ) : (
              <Moon size={20} />
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Conteúdo Principal */}
      <main className="max-w-125 mx-auto px-6 py-6 flex-1 w-full">
        <AnimatePresence mode="wait">
          {/* VIEW: DASHBOARD */}
          {abaAtiva === 0 && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-text-primary leading-tight">
                  Seu Painel
                </h2>
                <p className="text-sm text-text-secondary">
                  Gestão simplificada do seu negócio
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
                  label="Saldo total"
                  amount={saldo}
                  icon={Wallet}
                  variant="balance"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={abrirModal}
                className="w-full bg-primary hover:bg-primary-hover text-white rounded-2xl py-4 font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={24} strokeWidth={3} /> Adicionar movimento
              </motion.button>

              <section>
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-text-primary">
                    Recentes
                  </h3>
                  <button onClick={() => setAbaAtiva(1)} className="text-xs font-bold text-primary uppercase">Ver tudo</button>
                </div>
                <TransactionList transactions={movimentacoes.slice(0, 5)} />
              </section>
            </motion.div>
          )}

          {/* VIEW: LISTA COMPLETA */}
          {abaAtiva === 1 && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-text-primary">
                Movimentações
              </h2>
              <TransactionList transactions={movimentacoes} />
            </motion.div>
          )}

          {/* VIEW: RELATÓRIOS */}
          {abaAtiva === 2 && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-text-primary">
                Relatórios
              </h2>
              <ReportsView dadosMensais={dadosMensais} />
            </motion.div>
          )}

          {/* VIEW: AJUSTES */}
          {abaAtiva === 3 && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-text-primary">Ajustes</h2>

              <div className="space-y-3">
                {/* Perfil */}
                <div className="bg-surface border border-border-subtle rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                  {user?.image && (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={48}
                      height={48}
                      className="rounded-full"
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

                {/* Tema */}
                <button
                  onClick={alternarTema}
                  className="w-full bg-surface border border-border-subtle rounded-2xl p-5 flex items-center justify-between hover:bg-background-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {tema === "escuro" ? (
                      <Sun size={20} className="text-warning" />
                    ) : (
                      <Moon size={20} className="text-text-muted" />
                    )}
                    <span className="font-bold text-text-primary">
                      Tema do App
                    </span>
                  </div>
                  <span className="text-xs font-bold text-text-muted uppercase">
                    {tema}
                  </span>
                </button>

                {/* Logout */}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full bg-error/10 border border-error/20 text-error rounded-2xl p-5 font-bold flex items-center justify-center gap-2 hover:bg-error/20 transition-all"
                >
                  <LogOut size={20} />
                  Sair da conta
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Menu Inferior */}
      <BottomNav items={navItems} onItemClick={setAbaAtiva} />

      {/* Modal de Transação */}
      <AddTransactionModal
        isOpen={modalAberto}
        onClose={fecharModal}
        onAdd={adicionarMovimentacao}
      />
    </div>
  );
}
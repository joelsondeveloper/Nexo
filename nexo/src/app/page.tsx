import { auth } from "../auth";
import { LoginPage } from "./login/page";
import { DashboardPage } from "./components/dashboard-page";
import { AnimatePresence } from "framer-motion";
import { prisma } from "../lib/prisma";
import { TipoMovimentacao } from "./store/nexo-store";

export default async function Page() {
  // 1. Buscamos a sessão no servidor (mais rápido e seguro que no cliente)
  const session = await auth();

  // 2. Se não houver sessão, renderizamos a página de login
  if (!session) {
    return (
      <main>
        {/* AnimatePresence para garantir uma entrada suave */}
        <AnimatePresence mode="wait">
          <LoginPage />
        </AnimatePresence>
      </main>
    );
  }

  const transacoesDoBanco = await prisma.transaction.findMany({
    where: { userId: session.user?.id },
    orderBy: { date: 'desc' }
  });

  const transacoesFormatadas = transacoesDoBanco.map(t => ({
    id: t.id,
    tipo: ( t.type === "INCOME" ? "income" : "expense" ) as TipoMovimentacao,
    descricao: t.description,
    valor: t.amount,
    categoria: t.category || "Geral",
    data: t.date.toISOString().split('T')[0]
  }));

  // 3. Se houver sessão, renderizamos o Dashboard
  // Passamos o usuário da sessão para o Dashboard se precisar
  return <DashboardPage user={session.user} initialData={transacoesFormatadas} />;
}
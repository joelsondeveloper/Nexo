import { auth } from "../auth";
import { LoginPage } from "./login/page";
import { DashboardPage } from "./components/dashboard-page";
import { AnimatePresence } from "framer-motion";

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

  // 3. Se houver sessão, renderizamos o Dashboard
  // Passamos o usuário da sessão para o Dashboard se precisar
  return <DashboardPage user={session.user} />;
}
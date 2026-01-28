"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Loader, Chrome } from "lucide-react";
import { signIn } from "next-auth/react";

export function LoginPage() {
  const [carregando, setCarregando] = useState(false);

  const handleGoogleLogin = async () => {
    setCarregando(true);
    // O NextAuth cuida do redirecionamento
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo e Título */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-4">
            <span className="text-white font-black text-3xl">N</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-2">NEXO</h1>
          <p className="text-text-secondary">
            Gestão financeira inteligente para microempreendedores
          </p>
        </motion.div>

        {/* Card de Login */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-surface rounded-4xl shadow-sm border border-border-subtle p-8 text-center"
        >
          <h2 className="text-xl font-bold text-text-primary mb-2">Boas-vindas</h2>
          <p className="text-sm text-text-secondary mb-8">
            Entre com sua conta Google para gerenciar seu negócio de forma simples.
          </p>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={carregando}
              onClick={handleGoogleLogin}
              className="w-full bg-text-primary text-background-primary py-4 rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {carregando ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Chrome className="w-5 h-5" />
                  <span>Entrar com Google</span>
                </>
              )}
            </motion.button>
          </div>

          <p className="mt-8 text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold">
            Sem senhas • Acesso Seguro
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-xs text-text-muted mt-8"
        >
          Ao entrar, você concorda com nossos termos de uso.
        </motion.p>
      </motion.div>
    </div>
  );
}
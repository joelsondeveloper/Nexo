"use client";

import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { ConfirmacaoWidget } from "./confirmation-widget";

export interface Mensagem {
  id: string;
  tipo: "usuario" | "assistente";
  conteudo: string;
  timestamp: Date;
  confirmacao?: {
    tipo: "income" | "expense";
    descricao: string;
    valor: number;
    categoria?: string;
  };
}

interface ChatMessageProps {
  mensagem: Mensagem;
  onDesfazer?: () => void;
}

export function ChatMessage({ mensagem, onDesfazer }: ChatMessageProps) {
  const isUsuario = mensagem.tipo === "usuario";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 mb-6 ${isUsuario ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar Personalizado NEXO */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isUsuario ? "bg-primary text-white" : "bg-surface border border-border-subtle text-primary"
      }`}>
        {isUsuario ? <User size={16} strokeWidth={2.5} /> : <Sparkles size={16} strokeWidth={2.5} />}
      </div>

      {/* Conteúdo da Mensagem */}
      <div className={`flex-1 flex flex-col ${isUsuario ? "items-end" : "items-start"}`}>
        <div className={`max-w-[90%] px-4 py-3 shadow-sm ${
            isUsuario
              ? "bg-primary text-white rounded-2xl rounded-tr-none"
              : "bg-surface border border-border-subtle text-text-primary rounded-2xl rounded-tl-none"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {mensagem.conteudo}
          </p>
        </div>

        {/* Se a IA processou um comando financeiro, mostra o Widget abaixo do balão */}
        {mensagem.confirmacao && (
          <div className="w-full max-w-[90%]">
            <ConfirmacaoWidget
              tipo={mensagem.confirmacao.tipo}
              descricao={mensagem.confirmacao.descricao}
              valor={mensagem.confirmacao.valor}
              categoria={mensagem.confirmacao.categoria}
              onDesfazer={onDesfazer}
            />
          </div>
        )}

        {/* Hora da mensagem */}
        <span className="text-[10px] text-text-muted mt-1.5 font-bold uppercase tracking-widest px-1">
          {mensagem.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { ChatMessage, Mensagem } from "./chat-message";
import { processarMensagemIA } from "../actions/chat-actions";
import { Mic, Square, Loader2 } from "lucide-react";

export function ChatPage({
  onVoltar,
  user,
}: {
  onVoltar: () => void;
  user: any;
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: "1",
      tipo: "assistente",
      conteudo: `Olá, ${user?.name?.split(" ")[0]}! 👋 Eu sou o NEXO Inteligente. Me conte o que aconteceu financeiramente hoje (vendas ou gastos) e eu registro pra você.`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [carregando, setCarregando] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [gravando, setGravando] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) =>
        audioChunksRef.current.push(e.data);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(",")[1];

          // Envia para a IA
          setCarregando(true);
          const res = await processarMensagemIA(undefined, base64Audio);

          setMensagens((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              tipo: "assistente",
              conteudo: res.resposta,
              timestamp: new Date(),
              confirmacao: res.transacao,
            },
          ]);
          setCarregando(false);
        };
      };

      mediaRecorder.start();
      setGravando(true);
    } catch (err) {
      alert("Preciso de permissão para usar o microfone.");
    }
  };

  const pararGravacao = () => {
    mediaRecorderRef.current?.stop();
    setGravando(false);
    // Para todos os tracks de áudio para fechar o microfone no celular
    mediaRecorderRef.current?.stream
      .getTracks()
      .forEach((track) => track.stop());
  };

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [mensagens]);

  const handleEnviar = async () => {
    if (!inputText.trim() || carregando) return;

    const texto = inputText;
    setInputText("");

    // Adiciona mensagem do usuário
    const msgUser: Mensagem = {
      id: Date.now().toString(),
      tipo: "usuario",
      conteudo: texto,
      timestamp: new Date(),
    };
    setMensagens((prev) => [...prev, msgUser]);

    setCarregando(true);

    // CHAMADA REAL PARA A IA E BANCO DE DADOS
    const resultado = await processarMensagemIA(texto);

    const msgIA: Mensagem = {
      id: (Date.now() + 1).toString(),
      tipo: "assistente",
      conteudo: resultado.resposta,
      timestamp: new Date(),
      confirmacao: resultado.transacao
        ? {
            tipo: resultado.transacao.tipo,
            valor: resultado.transacao.valor,
            descricao: resultado.transacao.descricao,
          }
        : undefined,
    };

    setMensagens((prev) => [...prev, msgIA]);
    setCarregando(false);

    // Se registrou, avisamos o dashboard para atualizar os totais
    if (resultado.sucesso) {
      // O Next.js 'revalidatePath' já cuidará de atualizar os dados no background
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background-primary flex flex-col h-screen overflow-hidden">
      {/* Header Estilo App */}
      <header className="bg-surface border-b border-border-subtle p-4 flex items-center gap-4 shrink-0">
        <button
          onClick={onVoltar}
          className="p-2 hover:bg-background-secondary rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-text-muted" />
        </button>
        <div>
          <h1 className="font-bold text-text-primary flex items-center gap-2">
            <Sparkles size={16} className="text-primary" /> Assistente NEXO
          </h1>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-success uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />{" "}
            Online agora
          </div>
        </div>
      </header>

      {/* Área de Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {mensagens.map((m) => (
            <ChatMessage key={m.id} mensagem={m} />
          ))}
        </AnimatePresence>

        {carregando && (
          <div className="flex justify-start items-center gap-2 text-text-muted text-xs font-medium italic animate-pulse">
            <Sparkles size={12} /> Analisando sua mensagem...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Texto */}
      <div className="p-4 bg-surface border-t border-border-subtle shrink-0">
        <div className="max-w-125 mx-auto flex items-center gap-2 bg-background-secondary p-2 rounded-2xl border border-border-subtle">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleEnviar())
            }
            placeholder="Ex: Vendi um serviço por 150..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-2 resize-none max-h-32"
            rows={1}
          />
          <div className="flex items-center gap-2">
            {inputText.trim() === "" ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={gravando ? pararGravacao : iniciarGravacao}
                className={`p-4 rounded-full transition-all ${gravando ? "bg-error animate-pulse text-white" : "bg-primary/10 text-primary"}`}
              >
                {gravando ? <Square size={20} /> : <Mic size={20} />}
              </motion.button>
            ) : (
              <button
                onClick={handleEnviar}
                className="p-4 bg-primary text-white rounded-full"
              >
                <Send size={20} />
              </button>
            )}
          </div>
          <button
            onClick={handleEnviar}
            disabled={!inputText.trim() || carregando}
            className={`p-3 rounded-xl transition-all ${inputText.trim() ? "bg-primary text-white" : "bg-border-subtle text-text-muted"}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

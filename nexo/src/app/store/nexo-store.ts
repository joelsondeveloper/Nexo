import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createTransactionAction, deleteTransactionAction, updateTransactionAction } from "../actions/transaction-actions";


export type TipoMovimentacao = "income" | "expense";

export interface Movimentacao {
  id: string;
  tipo: TipoMovimentacao;
  categoria: string;
  valor: number;
  descricao: string;
  data: string;
}

export interface DadosMensais {
  mes: string;
  entradas: number;
  saidas: number;
}

export interface FeedbackFinanceiro {
  tipo: "sucesso" | "alerta" | "info";
  mensagem: string;
}

interface NexoState {
  tema: "claro" | "escuro";
  abaAtiva: number;
  modalAberto: boolean;
  movimentacoes: Movimentacao[];
  feedback: FeedbackFinanceiro | null;
  dadosMensais: DadosMensais[];

  // Ações
  alternarTema: () => void;
  setAbaAtiva: (aba: number) => void;
  abrirModal: () => void;
  fecharModal: () => void;
  setMovimentacoes: (lista: Movimentacao[]) => void; // Ação vital para sincronia
  adicionarMovimentacao: (movimentacao: Omit<Movimentacao, "id">) => void;
  removerMovimentacao: (id: string) => void;
  gerarFeedbackInteligente: () => void;
  limparFeedback: () => void;
  transacaoParaEditar: Movimentacao | null;
  setTransacaoParaEditar: (transacao: Movimentacao | null) => void;
  editarMovimentacao: (
    id: string,
    dados: Omit<Movimentacao, "id">,
  ) => Promise<void>;
}

// ... lógica de calcularFeedback permanece igual ...
function calcularFeedback(
  movimentacoes: Movimentacao[],
): FeedbackFinanceiro | null {
  if (movimentacoes.length === 0)
    return { tipo: "info", mensagem: "Bem-vindo! Registre algo para começar." };
  const totalEntradas = movimentacoes
    .filter((m) => m.tipo === "income")
    .reduce((acc, m) => acc + m.valor, 0);
  const totalSaidas = movimentacoes
    .filter((m) => m.tipo === "expense")
    .reduce((acc, m) => acc + m.valor, 0);
  if (totalSaidas > totalEntradas)
    return {
      tipo: "alerta",
      mensagem: "Atenção: Seus gastos superaram as vendas.",
    };
  return { tipo: "sucesso", mensagem: "Sua gestão está em dia!" };
}

export const useNexoStore = create<NexoState>()(
  persist(
    (set, get) => ({
      tema: "claro",
      abaAtiva: 0,
      modalAberto: false,
      movimentacoes: [],
      feedback: null,
      transacaoParaEditar: null,
      setTransacaoParaEditar: (transacao) =>
        set({ transacaoParaEditar: transacao }),
      dadosMensais: [
        { mes: "Out", entradas: 4500, saidas: 3200 },
        { mes: "Nov", entradas: 5200, saidas: 4100 },
        { mes: "Dez", entradas: 6500, saidas: 4800 },
        { mes: "Jan", entradas: 7800, saidas: 5100 },
      ],

      alternarTema: () => {
        const novoTema = get().tema === "claro" ? "escuro" : "claro";
        set({ tema: novoTema });
        // Aplica a classe no HTML imediatamente
        if (novoTema === "escuro") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },

      setAbaAtiva: (aba) => set({ abaAtiva: aba }),
      abrirModal: () => set({ modalAberto: true }),
      fecharModal: () => set({ modalAberto: false }),

      // Sincroniza o que veio do Banco com a Store
      setMovimentacoes: (lista) => {
        set({ movimentacoes: lista });
        get().gerarFeedbackInteligente();
      },

      adicionarMovimentacao: async (nova) => {
        const resultado = await createTransactionAction(nova);
        if (resultado.success && resultado.data) {
          const transacaoFormatada: Movimentacao = {
            id: resultado.data.id,
            tipo: nova.tipo,
            descricao: nova.descricao,
            valor: nova.valor,
            categoria: nova.categoria,
            data: nova.data,
          };
          set((state) => ({
            movimentacoes: [transacaoFormatada, ...state.movimentacoes],
          }));
          get().gerarFeedbackInteligente();
        }
      },

      removerMovimentacao: async (id) => {
        // 1. Chamada ao Banco de Dados
        const resultado = await deleteTransactionAction(id);

        if (resultado.success) {
          // 2. Se apagou no banco, removemos do estado local (UI)
          set((state) => ({
            movimentacoes: state.movimentacoes.filter((m) => m.id !== id),
          }));
          get().gerarFeedbackInteligente();
        } else {
          alert("Não foi possível excluir a transação.");
        }
      },

      editarMovimentacao: async (id, dados) => {
        const resultado = await updateTransactionAction(id, dados);
        if (resultado.success && resultado.data) {
          set((state) => ({
            movimentacoes: state.movimentacoes.map((m) =>
              m.id === id ? { ...dados, id } : m,
            ),
            transacaoParaEditar: null, // Limpa após editar
          }));
          get().gerarFeedbackInteligente();
        }
      },

      gerarFeedbackInteligente: () =>
        set({ feedback: calcularFeedback(get().movimentacoes) }),
      limparFeedback: () => set({ feedback: null }),
    }),
    {
      name: "nexo-app-prefs",
      storage: createJSONStorage(() => localStorage),
      // MÁGICA AQUI: Só salvamos o TEMA no localStorage.
      // As movimentações agora vêm do banco, então limpamos do storage.
      partialize: (state) => ({
        tema: state.tema,
      }),
    },
  ),
);

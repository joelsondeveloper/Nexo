import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// --- Tipos ---
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

  // Ações
  alternarTema: () => void;
  setAbaAtiva: (aba: number) => void;
  abrirModal: () => void;
  fecharModal: () => void;
  adicionarMovimentacao: (movimentacao: Omit<Movimentacao, "id">) => void;
  removerMovimentacao: (id: string) => void;
  gerarFeedbackInteligente: () => void;
  limparFeedback: () => void;
  
  // Dados Mockados para o gráfico (podem ser calculados das movimentações futuramente)
  dadosMensais: DadosMensais[];
}

// --- Lógica de Feedback "Humano" ---
function calcularFeedback(movimentacoes: Movimentacao[]): FeedbackFinanceiro | null {
  if (movimentacoes.length === 0) {
    return {
      tipo: "info",
      mensagem: "Boas-vindas ao NEXO! Comece registrando sua primeira venda ou despesa.",
    };
  }

  const hoje = new Date().toISOString().split("T")[0];
  const totalEntradas = movimentacoes
    .filter((m) => m.tipo === "income")
    .reduce((sum, m) => sum + m.valor, 0);

  const totalSaidas = movimentacoes
    .filter((m) => m.tipo === "expense")
    .reduce((sum, m) => sum + m.valor, 0);

  const movimentacoesHoje = movimentacoes.filter(m => m.data === hoje);

  // Regra 1: Feedback de venda no dia
  if (movimentacoesHoje.some(m => m.tipo === "income")) {
    return {
      tipo: "sucesso",
      mensagem: "Muito bem! Você já registrou entradas hoje. Continue assim!",
    };
  }

  // Regra 2: Alerta de saúde financeira
  if (totalSaidas > totalEntradas && totalEntradas > 0) {
    return {
      tipo: "alerta",
      mensagem: "Atenção: Suas despesas acumuladas superaram suas vendas. Hora de revisar os custos.",
    };
  }

  // Regra 3: Dica de gestão
  if (movimentacoes.length > 5 && totalSaidas < totalEntradas) {
    return {
      tipo: "info",
      mensagem: "Dica: Tente separar 20% do seu lucro para uma reserva de emergência.",
    };
  }

  return null;
}

// --- Store com Persistência ---
export const useNexoStore = create<NexoState>()(
  persist(
    (set, get) => ({
      tema: "claro",
      abaAtiva: 0,
      modalAberto: false,
      movimentacoes: [], // Começa vazio para o usuário real
      feedback: null,
      dadosMensais: [ // Dados estáticos para o gráfico do MVP
        { mes: "Out", entradas: 4500, saidas: 3200 },
        { mes: "Nov", entradas: 5200, saidas: 4100 },
        { mes: "Dez", entradas: 6500, saidas: 4800 },
        { mes: "Jan", entradas: 7800, saidas: 5100 },
      ],

      alternarTema: () => set((state) => ({ 
        tema: state.tema === "claro" ? "escuro" : "claro" 
      })),

      setAbaAtiva: (aba) => set({ abaAtiva: aba }),
      
      abrirModal: () => set({ modalAberto: true }),
      
      fecharModal: () => set({ modalAberto: false }),

      adicionarMovimentacao: (nova) => {
        const item: Movimentacao = { ...nova, id: crypto.randomUUID() };
        set((state) => ({
          movimentacoes: [item, ...state.movimentacoes],
        }));
        get().gerarFeedbackInteligente();
      },

      removerMovimentacao: (id) => {
        set((state) => ({
          movimentacoes: state.movimentacoes.filter((m) => m.id !== id),
        }));
        get().gerarFeedbackInteligente();
      },

      gerarFeedbackInteligente: () => {
        const feedback = calcularFeedback(get().movimentacoes);
        set({ feedback });
      },

      limparFeedback: () => set({ feedback: null }),
    }),
    {
      name: "nexo-storage", // nome da chave no localStorage
      storage: createJSONStorage(() => localStorage),
      // Persistir apenas os dados essenciais (não persistir estados de UI como modalAberto)
      partialize: (state) => ({
        tema: state.tema,
        movimentacoes: state.movimentacoes,
      }),
    }
  )
);
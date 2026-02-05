"use server";

import { parseFinanceMessage } from "@/src/lib/ai-parser";
import { createTransactionAction } from "./transaction-actions";

export async function processarMensagemIA(texto: string | undefined, audioBase64?: string) {
  try {
    // 1. Chama o Gemini para entender a frase
    const dadosExtraidos = await parseFinanceMessage(texto || "", audioBase64);

    if (dadosExtraidos && dadosExtraidos.valor > 0) {
      // 2. Registra no banco de dados Supabase
      await createTransactionAction({
        descricao: dadosExtraidos.descricao,
        valor: dadosExtraidos.valor,
        tipo: dadosExtraidos.tipo,
        categoria: dadosExtraidos.categoria,
        data: new Date().toISOString().split('T')[0]
      });

      return {
        sucesso: true,
        resposta: `Entendido! Registrei ${dadosExtraidos.tipo === 'income' ? 'uma entrada' : 'uma saída'} de R$ ${dadosExtraidos.valor.toFixed(2)}.`,
        transacao: dadosExtraidos
      };
    }

    return {
      sucesso: false,
      resposta: "Não consegui identificar um valor ou o tipo de movimentação. Pode repetir de outra forma? (Ex: paguei 30 reais de luz)"
    };
  } catch (error) {
    console.error("Erro no chat:", error);
    return { sucesso: false, resposta: "Ops, tive um problema técnico. Pode tentar novamente?" };
  }
}
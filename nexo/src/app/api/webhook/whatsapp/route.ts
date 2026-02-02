import { prisma } from "@/src/lib/prisma";
import { parseFinanceMessage } from "@/src/lib/ai-parser";
import { revalidatePath } from "next/cache";

/**
 * WEBHOOK NEXO - INTEGRAÇÃO TWILIO WHATSAPP
 * Este endpoint recebe as mensagens da Twilio, processa com a IA Gemini,
 * salva no Supabase e responde ao usuário via XML (TwiML).
 */

export async function POST(req: Request) {
  try {
    // 1. Capturar o corpo da requisição como texto (Twilio envia x-www-form-urlencoded)
    const formDataText = await req.text();
    const params = new URLSearchParams(formDataText);

    const messageText = params.get("Body"); // Texto enviado pelo usuário
    const fromNumber = params.get("From"); // Formato: whatsapp:+5511999999999

    console.log("LOG [Webhook]: Mensagem recebida:", { messageText, fromNumber });

    if (!messageText || !fromNumber) {
      return new Response("Dados ausentes", { status: 400 });
    }

    // 2. Limpar o número para buscar no Supabase (remove 'whatsapp:+' e deixa só números)
    const whatsappNumberClean = fromNumber.replace("whatsapp:+", "");

    // 3. Buscar usuário vinculado a esse número
    const user = await prisma.user.findUnique({
      where: { whatsappNumber: whatsappNumberClean },
    });

    if (!user) {
      console.log("LOG [Webhook]: Usuário não encontrado no banco:", whatsappNumberClean);
      // Retorna XML vazio para não gerar erro no log da Twilio
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // 4. Chamar a IA (Gemini) para extrair os dados da frase
    const data = await parseFinanceMessage(messageText);

    if (data && data.valor > 0) {
      // 5. Salvar a transação no Supabase
      await prisma.transaction.create({
        data: {
          description: data.descricao,
          amount: data.valor,
          type: data.tipo === "income" ? "INCOME" : "EXPENSE",
          category: data.categoria,
          source: "WHATSAPP",
          userId: user.id,
        },
      });

      // 6. Avisar ao Next.js que os dados mudaram para atualizar o Dashboard
      revalidatePath("/");

      // 7. GERAR RESPOSTA TWIML (XML) PARA O WHATSAPP
      const emoji = data.tipo === "income" ? "💰" : "💸";
      const tipoTexto = data.tipo === "income" ? "Entrada" : "Saída";
      
      const replyMessage = `✅ *NEXO:* ${tipoTexto} de *R$ ${data.valor.toFixed(2)}* salva com sucesso! ${emoji}\n📝 ${data.descricao}`;

      // Montagem do XML rigoroso que a Twilio exige
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${replyMessage}</Message>
</Response>`;

      console.log("LOG [Webhook]: Transação salva e enviando resposta ao WhatsApp.");

      return new Response(twiml, {
        status: 200,
        headers: {
          "Content-Type": "text/xml",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Caso a IA não tenha entendido um valor (valor 0 ou null)
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
      headers: { "Content-Type": "text/xml" },
    });

  } catch (error: any) {
    console.error("ERRO CRÍTICO WEBHOOK:", error.message);
    return new Response("Erro interno do servidor", { status: 500 });
  }
}

/**
 * GET opcional apenas para testar se a URL está ativa no navegador
 */
export async function GET() {
  return new Response("🚀 Webhook do NEXO está online e aguardando a Twilio!", { 
    status: 200 
  });
}
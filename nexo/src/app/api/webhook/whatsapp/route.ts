import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { parseFinanceMessage } from "@/src/lib/ai-parser";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    // 1. O Twilio envia os dados como texto de formulário, não JSON
    const text = await req.text();
    const params = new URLSearchParams(text);

    const messageText = params.get("Body"); // O que o usuário escreveu
    const from = params.get("From"); // Ex: whatsapp:+5511999999999

    console.log("Recebido do Twilio:", { messageText, from });

    if (!messageText || !from) {
      return new Response("Dados ausentes", { status: 400 });
    }

    // 2. Limpa o número para buscar no banco (remove 'whatsapp:+' e deixa só os números)
    const whatsappNumber = from.replace("whatsapp:+", "");

    // 3. Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { whatsappNumber: whatsappNumber },
    });

    if (!user) {
      console.log("Usuário não cadastrado com esse número:", whatsappNumber);
      // Retornamos XML vazio para o Twilio não dar erro
      return new Response("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // 4. Gemini processa a frase
    const data = await parseFinanceMessage(messageText);

    if (data && data.valor > 0) {
      // 5. Salvar no Banco
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

      revalidatePath("/");

      // 6. Resposta automática pro WhatsApp (Formato TwiML)
      const twiml = `
        <Response>
          <Message>✅ *NEXO:* ${data.tipo === "income" ? "Entrada" : "Saída"} de *R$ ${data.valor.toFixed(2)}* salva!\n📝 ${data.descricao}</Message>
        </Response>
      `;

      return new Response(twiml, {
        headers: { "Content-Type": "text/xml" },
      });
    }

    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("ERRO NO WEBHOOK:", error);
    return new Response("Erro interno", { status: 500 });
  }
}

// O Twilio às vezes faz um GET para validar a URL
export async function GET() {
  return new Response("Webhook NEXO Ativo", { status: 200 });
}

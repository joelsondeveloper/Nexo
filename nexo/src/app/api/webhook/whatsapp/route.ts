import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { parseFinanceMessage } from "@/src/lib/ai-parser";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    // 1. O Twilio envia dados como x-www-form-urlencoded
    const formData = await req.formData();
    const messageText = formData.get("Body") as string; // O que o usuário escreveu
    const from = formData.get("From") as string; // Ex: whatsapp:+5511999999999

    if (!messageText || !from) {
      return new Response("Erro: Dados ausentes", { status: 400 });
    }

    // 2. Limpa o número (remove 'whatsapp:+' e deixa só os números)
    const whatsappNumber = from.replace("whatsapp:+", "");

    // 3. Busca o usuário no Supabase
    const user = await prisma.user.findUnique({
      where: { whatsappNumber: whatsappNumber },
    });

    if (!user) {
      // Se o usuário não existir, retornamos um XML vazio que o Twilio entende
      return new Response("<Response></Response>", { headers: { "Content-Type": "text/xml" } });
    }

    // 4. Gemini processa a frase
    const data = await parseFinanceMessage(messageText);

    if (data && data.valor > 0) {
      // 5. Salva no Banco
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

      // 6. Resposta automática (O Twilio pede formato TwiML - XML)
      const twimlResponse = `
        <Response>
          <Message>✅ *NEXO:* ${data.tipo === 'income' ? 'Venda' : 'Gasto'} de *R$ ${data.valor.toFixed(2)}* salvo!\n📝 ${data.descricao}</Message>
        </Response>
      `;

      return new Response(twimlResponse, {
        headers: { "Content-Type": "text/xml" },
      });
    }

    return new Response("<Response></Response>", { headers: { "Content-Type": "text/xml" } });

  } catch (error) {
    console.error("Erro Webhook Twilio:", error);
    return new Response("Erro interno", { status: 500 });
  }
}
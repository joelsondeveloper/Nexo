import { prisma } from "@/src/lib/prisma";
import { parseFinanceMessage } from "@/src/lib/ai-parser";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const formDataText = await req.text();
    const params = new URLSearchParams(formDataText);
    const messageText = params.get("Body");
    const fromNumber = params.get("From"); // whatsapp:+55119...

    if (!messageText || !fromNumber) return new Response("Ok", { status: 200 });

    const whatsappNumberClean = fromNumber.replace("whatsapp:+", "");
    const user = await prisma.user.findUnique({ where: { whatsappNumber: whatsappNumberClean } });

    if (!user) return new Response("User not found", { status: 200 });

    const data = await parseFinanceMessage(messageText);

    if (data && data.valor > 0) {
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

      // --- NOVA FORMA DE ENVIAR (REST API) ---
      const replyMessage = `✅ *NEXO:* ${data.tipo === 'income' ? 'Entrada' : 'Saída'} de *R$ ${data.valor.toFixed(2)}* salva!\n📝 ${data.descricao}`;
      
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioNumber = params.get("To"); // O número do seu robô

      // Chamada direta para a API da Twilio para garantir o envio
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
        },
        body: new URLSearchParams({
          To: fromNumber,
          From: twilioNumber!,
          Body: replyMessage
        })
      });
    }

    return new Response("Processado", { status: 200 });
  } catch (error) {
    console.error("Erro Webhook:", error);
    return new Response("Erro", { status: 500 });
  }
}
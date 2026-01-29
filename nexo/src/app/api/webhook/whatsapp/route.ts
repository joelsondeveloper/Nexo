import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { parseFinanceMessage } from "@/src/lib/ai-parser";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Extrair os dados da Evolution API
    // O campo 'data.message.conversation' contém o texto no padrão da Evolution
    const messageText = body.data?.message?.conversation || body.data?.message?.extendedTextMessage?.text;
    const remoteJid = body.data?.key?.remoteJid; // Ex: 5511999999999@s.whatsapp.net

    if (!messageText || !remoteJid) {
      return NextResponse.json({ message: "Ignorado: Sem conteúdo útil" });
    }

    // 2. Limpar o número (remover @s.whatsapp.net)
    const whatsappNumber = remoteJid.split("@")[0];

    // 3. Buscar usuário no banco (VITAL PARA SEGURANÇA)
    const user = await prisma.user.findUnique({
      where: { whatsappNumber: whatsappNumber },
    });

    if (!user) {
      console.log(`Mensagem de número não cadastrado: ${whatsappNumber}`);
      return NextResponse.json({ message: "Usuário não cadastrado" });
    }

    // 4. Processar com a IA
    const data = await parseFinanceMessage(messageText);

    if (!data || data.valor === 0) {
      return NextResponse.json({ message: "IA não identificou valores" });
    }

    // 5. Salvar no Banco vinculado ao usuário
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

    // 6. Atualizar o Dashboard em tempo real
    revalidatePath("/");

    return NextResponse.json({ 
      success: true, 
      message: `Registrado: ${data.descricao} - R$ ${data.valor}` 
    });

  } catch (error) {
    console.error("ERRO WEBHOOK WHATSAPP:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
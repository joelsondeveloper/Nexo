"use server";

import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTransactionAction(formData: {
  tipo: "income" | "expense";
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
}) {
  // 1. Verificar se o usuário está logado
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Você precisa estar logado para realizar esta ação.");
  }

  // 2. Salvar no banco via Prisma
  try {
    const transaction = await prisma.transaction.create({
      data: {
        description: formData.descricao,
        amount: formData.valor,
        type: formData.tipo === "income" ? "INCOME" : "EXPENSE",
        date: new Date(formData.data),
        category: formData.categoria,
        source: "WEB",
        userId: session.user.id, // Vínculo com o usuário logado
      },
    });

    // 3. Limpar o cache da página para os dados novos aparecerem
    revalidatePath("/");

    return { success: true, data: transaction };
  } catch (error) {
    console.error("Erro ao salvar transação:", error);
    return { success: false, error: "Falha ao salvar no banco de dados." };
  }
}

// Adicione ao src/app/actions/transaction-actions.ts

export async function deleteTransactionAction(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  try {
    // Segurança: Garantimos que o ID da transação pertença ao Usuário Logado
    await prisma.transaction.delete({
      where: {
        id: id,
        userId: session.user.id, 
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return { success: false, error: "Erro ao excluir do banco." };
  }
}

// Adicione ao src/app/actions/transaction-actions.ts

export async function updateTransactionAction(
  id: string,
  formData: {
    tipo: "income" | "expense";
    descricao: string;
    valor: number;
    categoria: string;
    data: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  try {
    const updated = await prisma.transaction.update({
      where: { 
        id: id,
        userId: session.user.id // Garantia de segurança
      },
      data: {
        description: formData.descricao,
        amount: formData.valor,
        type: formData.tipo === "income" ? "INCOME" : "EXPENSE",
        date: new Date(formData.data),
        category: formData.categoria,
      },
    });

    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    return { success: false };
  }
}
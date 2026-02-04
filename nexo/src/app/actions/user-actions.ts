"use server";

import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

export async function deleteAccountAction() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await prisma.user.delete({
      where: { id: session.user.id },
    });
  } catch (error) {
    return { error: "Falha ao deletar conta" };
  }

  redirect("/login");
}
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Conecta o Auth.js ao seu banco de dados Supabase via Prisma
  adapter: PrismaAdapter(prisma),
  
  // Configura o Login Social do Google
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Opcional: força a conta do Google a sempre pedir seleção se houver mais de uma
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  
  // Callbacks são funções que rodam em eventos específicos
  callbacks: {
    // Esse passo é vital: ele injeta o ID do usuário do banco na sessão
    // Assim, no Dashboard, você sabe exatamente de QUEM são as vendas
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  
  // Define páginas personalizadas se necessário
  pages: {
    signIn: "/login", // Redireciona para sua página customizada de login
  },
})
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Configuramos a fonte Geist para preencher a variável que nossos tokens esperam
const geistSans = Geist({
  variable: "--token-font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXO | Gestão Inteligente para Microempreendedores",
  description: "Centralize seu controle financeiro e estoque de forma simples e humana.",
  keywords: ["gestão", "financeiro", "microempreendedor", "nexo", "estoque"],
  authors: [{ name: "NEXO Team" }],
  manifest: "/manifest.json", // Recomendado para PWA no futuro
};

// Configuração de Viewport para evitar zoom automático em inputs no iOS e definir cor do tema
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          font-sans 
          antialiased 
          bg-background-primary 
          text-text-primary
          selection:bg-primary/20
          selection:text-primary
        `}
      >
        {/* 
            A classe 'bg-background-primary' e 'text-text-primary' garantem 
            que o app comece com as cores dos seus tokens e suporte o dark mode 
            nativamente assim que a classe .dark for injetada.
        */}
        {children}
      </body>
    </html>
  );
}
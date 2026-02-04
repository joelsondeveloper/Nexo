"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X, Download, Share } from "lucide-react";

export function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    // 1. Detectar plataforma
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) setPlatform("ios");
    else if (/android/.test(userAgent)) setPlatform("android");

    // 2. Capturar evento de instalação (Chrome/Android)
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      checkDisplayMode();
    });

    const checkDisplayMode = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const bannerClosed = sessionStorage.getItem("pwa-banner-closed");
      if (!isStandalone && !bannerClosed) {
        setShowBanner(true);
      }
    };

    // Para iOS, mostramos o banner baseada na detecção simples
    if (!window.matchMedia("(display-mode: standalone)").matches && !sessionStorage.getItem("pwa-banner-closed")) {
        setTimeout(checkDisplayMode, 3000);
    }
  }, []);

  const handleInstall = async () => {
    if (platform === "android" && deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (platform === "ios") {
      alert("No iPhone: Clique no ícone de 'Compartilhar' abaixo e depois em 'Adicionar à Tela de Início' 📲");
    }
  };

  const handleClose = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-banner-closed", "true");
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-24 left-4 right-4 z-50 max-w-125 mx-auto"
        >
          <div className="bg-primary text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <div className="bg-white/20 p-3 rounded-xl shrink-0">
              {platform === "ios" ? <Share size={24} /> : <Download size={24} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold">Instalar NEXO</h4>
              <p className="text-[11px] text-white/80 leading-tight">
                {platform === "ios" 
                  ? "Toque em compartilhar e 'Adicionar à Tela de Início'" 
                  : "Acesse como um app nativo e economize dados."}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={handleInstall}
                className="bg-white text-primary px-3 py-2 rounded-lg text-xs font-bold shadow-sm"
              >
                {platform === "ios" ? "Como?" : "Baixar"}
              </button>
              <button onClick={handleClose} className="p-2 opacity-60"><X size={18} /></button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
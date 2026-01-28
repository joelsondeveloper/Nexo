"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

interface DadosMensais {
  mes: string;
  entradas: number;
  saidas: number;
}

interface ReportsViewProps {
  dadosMensais: DadosMensais[];
}

export function ReportsView({ dadosMensais }: ReportsViewProps) {
  // Cálculo do saldo por mês
  const dadosSaldo = dadosMensais.map((data) => ({
    mes: data.mes,
    valor: data.entradas - data.saidas,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Resumo em Barras de Progresso (Visualização Rápida) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <Target className="text-primary" size={20} />
          <h3 className="font-bold text-text-primary">Desempenho por Mês</h3>
        </div>
        
        <div className="space-y-6">
          {dadosMensais.map((data, index) => {
            const total = data.entradas + data.saidas;
            const percEntrada = (data.entradas / total) * 100;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-text-primary uppercase tracking-wider">{data.mes}</span>
                  <span className={`text-sm font-bold ${data.entradas >= data.saidas ? "text-income" : "text-expense"}`}>
                    Saldo: {formatCurrency(data.entradas - data.saidas)}
                  </span>
                </div>
                
                {/* Barra de Proporção Entradas vs Saídas */}
                <div className="h-3 w-full bg-background-secondary rounded-full overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percEntrada}%` }}
                    className="bg-income h-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - percEntrada}%` }}
                    className="bg-expense h-full opacity-80"
                  />
                </div>

                <div className="flex justify-between text-[10px] font-bold uppercase text-text-muted">
                  <span className="flex items-center gap-1"><TrendingUp size={10} /> {formatCurrency(data.entradas)}</span>
                  <span className="flex items-center gap-1"><TrendingDown size={10} /> {formatCurrency(data.saidas)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 2. Gráfico de Barras de Saldo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-sm"
      >
        <h3 className="font-bold text-text-primary mb-6">Evolução do Saldo</h3>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosSaldo} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="mes" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
              />
              <Tooltip 
                cursor={{ fill: 'var(--color-background-secondary)' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: 'var(--shadow-lg)',
                  backgroundColor: 'var(--color-surface)' 
                }}
              />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                {dadosSaldo.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={entry.valor >= 0 ? "var(--color-income)" : "var(--color-expense)"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 3. Insight Card (Estilo FeedbackBanner) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className={`p-4 rounded-2xl border flex items-center gap-3 ${
          dadosSaldo[dadosSaldo.length - 1]?.valor >= 0 
          ? "bg-income/10 border-income/20 text-income" 
          : "bg-expense/10 border-expense/20 text-expense"
        }`}
      >
        <div className="p-2 bg-surface rounded-full shadow-sm">
          {dadosSaldo[dadosSaldo.length - 1]?.valor >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        </div>
        <p className="text-sm font-bold leading-tight">
          {dadosSaldo[dadosSaldo.length - 1]?.valor >= 0 
            ? "Boa! Seu saldo fechou positivo no último mês." 
            : "Atenção: Suas despesas superaram as entradas este mês."}
        </p>
      </motion.div>
    </div>
  );
}
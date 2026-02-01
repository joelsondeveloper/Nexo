import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function parseFinanceMessage(text: string) {
  // Configuração de Schema Ultra-Rígida
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.1, // Baixa temperatura = Respostas mais previsíveis e precisas
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          descricao: { type: SchemaType.STRING, description: "Breve descrição do que foi comprado ou vendido" },
          valor: { type: SchemaType.NUMBER, description: "Valor numérico absoluto" },
          tipo: { type: SchemaType.STRING, enum: ["income", "expense"], description: "income para entrada/venda, expense para saída/pagamento" },
          categoria: { type: SchemaType.STRING, description: "Uma categoria curta como 'Vendas', 'Suprimentos', 'Infraestrutura', 'Pessoal'" }
        },
        required: ["descricao", "valor", "tipo", "categoria"],
      } as any,
    },
    // Instruções de sistema que ficam separadas do prompt (mais segurança)
    systemInstruction: `Você é um extrator de dados financeiros para microempreendedores brasileiros. 
    Sua única tarefa é ler frases e extrair os dados para JSON.
    Regras de ouro:
    - Interprete gírias: 'paguei', 'gastei', 'pix pra', 'boleto', 'perdi' são sempre 'expense'.
    - Interprete gírias: 'recebi', 'vendi', 'entrou', 'ganhei', 'pix de' são sempre 'income'.
    - Se o usuário não disser o valor claramente (ex: 'vendi um bolo'), retorne null ou valor 0.
    - O campo categoria deve ser padronizado: Aluguel, Vendas, Fornecedores, Salários, Impostos, Marketing ou Diversos.
    - NUNCA adicione texto extra. Retorne apenas o objeto JSON.`
  });

  try {
    const result = await model.generateContent(text);
    const content = result.response.text();
    if (!content) return null;
    return JSON.parse(content);
  } catch (error) {
    console.error("Erro Crítico no Parser de IA:", error);
    return null;
  }
}
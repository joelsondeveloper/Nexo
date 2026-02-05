import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function parseFinanceMessage(text: string, audioBase64?: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
      temperature: 0.1, // Quase zero para ser determinístico
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          descricao: { type: SchemaType.STRING },
          valor: { type: SchemaType.NUMBER },
          tipo: { type: SchemaType.STRING, enum: ["income", "expense"] },
          categoria: { type: SchemaType.STRING }
        },
        required: ["descricao", "valor", "tipo", "categoria"],
      } as any,
    },
    systemInstruction: `Você é o processador de dados do NEXO. 
    Sua única função é extrair JSON de frases financeiras.
    - Se o usuário recebeu dinheiro ou vendeu algo: tipo="income".
    - Se o usuário pagou algo ou teve custo: tipo="expense".
    - Se houver quantidade (ex: "3 cafés"), inclua na descrição.
    - Categorias permitidas: Vendas, Alimentação, Transporte, Infraestrutura, Marketing, Impostos, Pessoal ou Diversos.
    - NUNCA retorne nada além do JSON puro.`
  });

  const promptParts: any[] = [text];

  if (audioBase64) {
    promptParts.push({
      inlineData: {
        data: audioBase64,
        mimeType: "audio/webm" // Formato padrão do MediaRecorder no Chrome/Android
      }
    });
  }

  try {
    const result = await model.generateContent(promptParts);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Erro na IA:", error);
    return null;
  }
}
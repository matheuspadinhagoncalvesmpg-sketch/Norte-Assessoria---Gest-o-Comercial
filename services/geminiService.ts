import { GoogleGenAI, Type } from "@google/genai";
import { DailyMetric, MeetingRecording } from "../types";

// Função para obter a instância da AI com a chave mais recente
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getCommercialInsights = async (data: DailyMetric[]) => {
  const ai = getAI();
  const prompt = `Analise os seguintes dados comerciais da agência "Norte Assessoria":
  ${JSON.stringify(data)}
  
  Forneça uma análise estratégica sobre a taxa de conversão entre leads, qualificações, reuniões e vendas. 
  Identifique gargalos e sugira melhorias práticas para aumentar o ROI.
  
  Responda obrigatoriamente no formato JSON definido pelo esquema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            status: { type: Type.STRING }
          },
          required: ["analysis", "suggestions", "status"]
        }
      }
    });

    return JSON.parse(response.text?.trim() || "{}");
  } catch (error) {
    console.error("Error fetching insights:", error);
    throw error;
  }
};

export const analyzeMeetingRecording = async (base64Data: string, closerName: string, mimeType: string) => {
  const ai = getAI();
  const prompt = `Você é um Sales Coach de elite da Norte Assessoria. 
  Analise esta gravação de reunião de vendas feita pelo closer "${closerName}".
  
  Avalie tecnicamente:
  1. Rapport e Conexão Inicial.
  2. Diagnóstico: Ele descobriu a dor real?
  3. Proposta de Valor: A solução Norte Assessoria resolve o problema?
  4. Objeções: Como ele contornou?
  5. Fechamento: Houve clareza no próximo passo?
  
  Retorne um relatório JSON detalhado.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: mimeType, data: base64Data } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            techniquesObserved: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["overallScore", "strengths", "weaknesses", "improvementPoints", "summary"]
        }
      }
    });

    return JSON.parse(response.text?.trim() || "{}");
  } catch (error) {
    console.error("Error analyzing recording:", error);
    throw error;
  }
};

export const generateSalesFeedbackReport = async (recordings: MeetingRecording[], period: 'Diário' | 'Semanal' | 'Mensal') => {
  const ai = getAI();
  const completedAnalyses = recordings
    .filter(r => r.status === 'completed' && r.analysis)
    .map(r => ({
      closer: r.closerName,
      client: r.clientName,
      date: r.date,
      score: r.analysis?.overallScore,
      summary: r.analysis?.summary
    }));

  if (completedAnalyses.length === 0) {
    return "Não há análises concluídas suficientes para gerar um relatório consolidado.";
  }

  const prompt = `Como Master Sales Coach da Norte Assessoria, gere um **Relatório de Performance ${period}** consolidado.
  Use como base estas análises individuais de reuniões recentes:
  ${JSON.stringify(completedAnalyses)}
  
  Seu objetivo é:
  1. Identificar padrões de acertos e erros na equipe.
  2. Fornecer 3 conselhos práticos para o próximo período.
  3. Dar uma nota geral de performance para a agência no período.
  
  Escreva em tom de liderança, inspirador e extremamente técnico. Use Markdown para formatar (negrito, listas, títulos).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error generating feedback report:", error);
    return "Ocorreu um erro ao gerar o relatório. Tente novamente.";
  }
};
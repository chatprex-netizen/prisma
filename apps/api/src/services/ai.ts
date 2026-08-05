import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAIResponse(
  userText: string, 
  assistantConfig: any, 
  chatId: string
): Promise<string | null> {
  try {
    // 1. Fetch conversation history for context
    const recentMessages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    const messages: any[] = recentMessages.reverse().map((msg: any) => ({
      role: msg.isFromUser ? 'user' : 'assistant',
      content: msg.content
    }));

    // Add System Prompt
    const systemMessage = {
      role: 'system',
      content: `
${assistantConfig.prompt}

KNOWLEDGE BASE:
${assistantConfig.knowledgeBase || 'No additional knowledge base provided.'}
      `.trim()
    };

    const completion = await openai.chat.completions.create({
      model: assistantConfig.model || 'gpt-4o-mini',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 250,
      // Tools setup for Orchestrator/Transfer could be added here
      // tools: [ ... ] 
    });

    return completion.choices[0].message.content;
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    return null;
  }
}

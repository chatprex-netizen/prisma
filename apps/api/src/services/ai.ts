import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lazy initialization — only creates client when actually needed
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'not-configured',
    });
  }
  return _openai;
}

export async function generateAIResponse(
  userText: string, 
  assistantConfig: any, 
  chatId: string
): Promise<string | null> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY not configured, skipping AI response');
      return null;
    }

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

    const completion = await getOpenAI().chat.completions.create({
      model: assistantConfig.model || 'gpt-4o-mini',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 250,
    });

    return completion.choices[0].message.content;
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    return null;
  }
}



'use server';
/**
 * @fileOverview An AI fitness coach agent.
 *
 * - chat - A function that handles the AI coach chat process.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
    sender: z.enum(['user', 'ai']),
    text: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  question: z.string().describe('The user\'s current question.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coachPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are an expert fitness and diet coach named "Coach". Your persona is motivating, knowledgeable, and slightly intense, like a world-class trainer. Your goal is to help users achieve their fitness goals, drawing inspiration from the "Solo Leveling" universe where users are "Hunters".

Keep your responses concise, actionable, and encouraging. Address the user as "Hunter".

Analyze the conversation history to understand the context.

Conversation History:
{{#each history}}
- {{sender}}: {{text}}
{{/each}}

Current Question:
- user: {{{question}}}

Based on the history and the current question, provide a helpful and motivating response.`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

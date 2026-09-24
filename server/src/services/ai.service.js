// ============================================
// AI service — Groq-based ticket classification
// ============================================

import Groq from 'groq-sdk';
import env from '../config/env.js';

let groq = null;

const getGroqClient = () => {
  if (!groq && env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return groq;
};

/**
 * Classify a ticket using AI.
 * Returns suggested category, priority, and probable issue type.
 */
export const classifyTicket = async (subject, description, categories = [], priorities = []) => {
  const client = getGroqClient();
  if (!client) {
    return null; // AI not configured — skip gracefully
  }

  const categoryNames = categories.map((c) => c.name).join(', ');
  const priorityLabels = priorities.map((p) => p.label).join(', ');

  const prompt = `You are an IT helpdesk AI assistant. Analyze the following support ticket and classify it.

Subject: ${subject}
Description: ${description}

Available categories: ${categoryNames || 'Hardware, Software, Network, Email, Access/Permissions, Other'}
Available priorities: ${priorityLabels || 'Critical, High, Medium, Low'}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "suggestedCategory": "<one of the available categories>",
  "suggestedPriority": "<one of the available priorities>",
  "probableIssue": "<brief 1-sentence diagnosis>",
  "confidence": <number between 0 and 1>
}`;

  try {
    const completion = await client.chat.completions.create({
      model: env.GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 200,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return null;

    // Parse JSON response (handle possible markdown code fences)
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);

    return {
      suggestedCategory: result.suggestedCategory || null,
      suggestedPriority: result.suggestedPriority || null,
      probableIssue: result.probableIssue || null,
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.5,
      accepted: false,
    };
  } catch (err) {
    console.error('[AI] Classification failed:', err.message);
    return null;
  }
};

/**
 * Generate a knowledge base article suggestion from a resolved ticket.
 */
export const suggestKBArticle = async (ticket) => {
  const client = getGroqClient();
  if (!client) return null;

  const prompt = `Based on this resolved IT support ticket, write a concise knowledge base article.

Ticket Subject: ${ticket.subject}
Ticket Description: ${ticket.description}
Resolution Notes: ${ticket.comments?.map((c) => c.content).join('\n') || 'N/A'}

Respond ONLY with valid JSON:
{
  "title": "<article title>",
  "content": "<article content in markdown format, include Problem, Solution, and Additional Notes sections>",
  "tags": ["<tag1>", "<tag2>"]
}`;

  try {
    const completion = await client.chat.completions.create({
      model: env.GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return null;

    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[AI] KB suggestion failed:', err.message);
    return null;
  }
};

import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateInsights(brewData: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: `You are a coffee analysis assistant helping a home barista improve their pour-over coffee.
You will be given a JSON log of their brew history including beans, grind settings, Aiden brewer settings, and tasting scores.
Analyze the data and provide 3-6 specific, actionable insights about patterns you observe.
Focus on: correlations between settings and scores, producer/bean patterns, grind size trends, temperature effects.
Be concise and specific — cite actual numbers from the data when possible.
Format your response as a bulleted list of insights.`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Here is my brew history:\n\n${brewData}\n\nWhat patterns do you see?`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== "text") return "No insights available.";
  return block.text;
}

import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateInsights(brewData: string, outsideData?: string): Promise<string> {
  const userContent = outsideData
    ? `Here is my home brew history:\n\n${brewData}\n\nHere are outside cups I've had at cafés:\n\n${outsideData}\n\nWhat patterns do you see? Include any comparisons between my home brews and café cups if relevant.`
    : `Here is my brew history:\n\n${brewData}\n\nWhat patterns do you see?`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: `You are a coffee analysis assistant helping a home barista improve their pour-over coffee.
You will be given a JSON log of their home brew history (including beans, grind settings, Aiden brewer settings, and tasting scores) and optionally a log of outside cups they have had at cafés.
Analyze the data and provide 3-6 specific, actionable insights about patterns you observe.
Focus on: correlations between settings and scores, producer/bean patterns, grind size trends, temperature effects, and if outside cups are provided, how home brews compare to café experiences.
The "strength" field is a slider from -10 (too weak) to +10 (too strong), with 0 meaning perfect.
Be concise and specific — cite actual numbers from the data when possible.
Format your response as a bulleted list of insights.`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== "text") return "No insights available.";
  return block.text;
}

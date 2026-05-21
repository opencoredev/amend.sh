export const aiCrawlerNames = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "CCBot",
] as const;

export const aiAccessUserAgents = [
  {
    name: "OAI-SearchBot",
    value: "OAI-SearchBot/1.0; +https://openai.com/searchbot",
  },
  {
    name: "ChatGPT-User",
    value: "ChatGPT-User/1.0; +https://openai.com/bot",
  },
  {
    name: "Claude-SearchBot",
    value: "Claude-SearchBot/1.0; +https://www.anthropic.com/searchbot",
  },
  {
    name: "Claude-User",
    value: "Claude-User/1.0; +https://www.anthropic.com",
  },
  {
    name: "ClaudeBot",
    value: "ClaudeBot/1.0; +https://www.anthropic.com/claudebot",
  },
  {
    name: "PerplexityBot",
    value: "PerplexityBot/1.0; +https://perplexity.ai/perplexitybot",
  },
  {
    name: "Perplexity-User",
    value:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)",
  },
  {
    name: "Googlebot",
    value: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
  {
    name: "Google-Extended",
    value: "Google-Extended",
  },
  {
    name: "Bingbot",
    value: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  },
  {
    name: "CCBot",
    value: "CCBot/2.0 (https://commoncrawl.org/faq/)",
  },
  {
    name: "GPTBot",
    value: "GPTBot/1.0; +https://openai.com/gptbot",
  },
] as const;

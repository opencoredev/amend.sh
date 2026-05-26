export function providerLabel(provider: string) {
  const labels: Record<string, string> = {
    databuddy: "DataBuddy",
    discord: "Discord",
    feedback: "Feedback board",
    github: "GitHub",
    linear: "Linear",
    posthog: "PostHog",
    sdk: "SDK / API",
    slack: "Slack",
    support: "Support",
    x: "X",
  };
  return labels[provider] ?? provider;
}

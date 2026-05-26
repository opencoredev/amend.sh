export function ProactivationAgentMetrics({
  buildBriefCount,
  connectedChannelCount,
  decisionCount,
  inputChannelCount,
  runCount,
}: {
  buildBriefCount: number;
  connectedChannelCount: number;
  decisionCount: number;
  inputChannelCount: number;
  runCount: number;
}) {
  return (
    <div className="grid border-b border-border md:grid-cols-5">
      <AgentMetric label="Input channels" value={inputChannelCount} />
      <AgentMetric label="Connected" value={connectedChannelCount} />
      <AgentMetric label="Runs" value={runCount} />
      <AgentMetric label="Decisions" value={decisionCount} />
      <AgentMetric label="Build briefs" value={buildBriefCount} />
    </div>
  );
}

function AgentMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-3 border-b border-border px-4 md:border-r md:border-b-0 md:last:border-r-0">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}

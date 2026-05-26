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
    <div className="grid grid-cols-5 border-b border-border">
      <AgentMetric label="Inputs" value={inputChannelCount} />
      <AgentMetric label="Connected" value={connectedChannelCount} />
      <AgentMetric label="Runs" value={runCount} />
      <AgentMetric label="Decisions" value={decisionCount} />
      <AgentMetric label="Briefs" value={buildBriefCount} />
    </div>
  );
}

function AgentMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col justify-center gap-1 border-r border-border px-4 py-3 last:border-r-0">
      <span className="font-mono text-xl font-semibold tabular-nums leading-none">{value}</span>
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

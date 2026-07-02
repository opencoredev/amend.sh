/**
 * Recharts surface for the Insights view — the channel breakdown bar chart.
 * (The Signal-vs-Shipped area chart is dithered and lives in
 * amend-dithered-area.tsx.) Themed to the console: gold bars, near-invisible
 * grid/ticks, a dark popover tooltip with mono numerals.
 */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { channelMeta } from "@/components/amend-agent-shared";
import type { InsightsChannelSlice } from "@/lib/amend-contract";

const GOLD = "#ef9836"; // demand
const AXIS = "#8a8a93"; // muted tick text
const GRID = "rgba(255,255,255,0.05)";

type TooltipDatum = {
  name?: string;
  value?: number | string;
  color?: string;
};

type ChartTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: TooltipDatum[];
};

/** Dark popover tooltip matching the console's surfaces and mono numerals. */
function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#191613] px-3 py-2 shadow-xl shadow-black/40">
      {label != null ? (
        <p className="mb-1.5 text-[0.7rem] font-medium text-muted-foreground">{label}</p>
      ) : null}
      <div className="grid gap-1">
        {payload.map((datum, i) => (
          <div className="flex items-center gap-2 text-xs" key={`${datum.name}-${i}`}>
            <span
              className="size-2 shrink-0 rounded-[3px]"
              style={{ background: datum.color ?? GOLD }}
            />
            <span className="text-muted-foreground">{datum.name}</span>
            <span className="ml-auto pl-3 font-mono font-semibold tabular-nums text-foreground">
              {datum.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChannelBarChart({
  data,
  animate,
}: {
  data: InsightsChannelSlice[];
  animate: boolean;
}) {
  const rows = data.map((slice) => ({
    label: channelMeta[slice.channel].label,
    count: slice.count,
  }));
  return (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart
        barCategoryGap={12}
        data={rows}
        layout="vertical"
        margin={{ bottom: 4, left: 6, right: 14, top: 4 }}
      >
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis allowDecimals={false} hide type="number" />
        <YAxis
          axisLine={false}
          dataKey="label"
          tick={{ fill: AXIS, fontSize: 12 }}
          tickLine={false}
          type="category"
          width={62}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar
          dataKey="count"
          isAnimationActive={animate}
          maxBarSize={22}
          name="Mentions"
          radius={[0, 6, 6, 0]}
        >
          {rows.map((row, i) => (
            <Cell fill={GOLD} fillOpacity={1 - i * 0.15} key={row.label} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

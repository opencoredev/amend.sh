import { memoryRows } from "./home-content";

export function MemorySection() {
  return (
    <section className="amend-deferred-section relative z-10 border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-28">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">The record</p>
          <h2 className="amend-display mt-5 max-w-lg text-4xl font-medium leading-tight sm:text-5xl">
            When someone asks why you built it, the answer is already there.
          </h2>
        </div>

        <div className="grid border-y text-sm">
          {memoryRows.map(([label, value]) => (
            <div
              key={label}
              className="grid gap-3 border-b py-5 last:border-b-0 sm:grid-cols-[12rem_minmax(0,1fr)]"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-foreground">{label}</p>
              <p className="leading-6 text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export type Check = {
  detail?: string;
  name: string;
  ok: boolean;
};

export type ProductionReport = {
  blockers?: unknown;
  ok?: unknown;
  steps?: {
    built?: {
      ok?: unknown;
      summary?: {
        passed?: unknown;
        total?: unknown;
      };
    };
    live?: {
      ok?: unknown;
      report?: {
        blockers?: unknown;
        checks?: unknown;
        ok?: unknown;
        passed?: unknown;
        total?: unknown;
      };
    };
    readinessStrict?: {
      ok?: unknown;
    };
    status?: {
      ok?: unknown;
      report?: {
        ok?: unknown;
        productionEnv?: {
          missing?: unknown;
          passed?: unknown;
          total?: unknown;
        };
      };
    };
  };
};

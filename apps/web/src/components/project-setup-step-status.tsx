import { Check, CircleDashed } from "@/lib/icons";

import type { WebsiteLookupStatus } from "@/components/amend-dashboard-types";

export function SetupStepHeader({ copy, title }: { copy: string; title: string }) {
  return (
    <div className="grid gap-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm leading-6 text-muted-foreground">{copy}</p>
    </div>
  );
}

export function WebsiteLookupMessage({
  message,
  status,
}: {
  message: string;
  status: WebsiteLookupStatus;
}) {
  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <CircleDashed className="size-3.5 animate-spin" />
        Checking domain and loading product details
      </div>
    );
  }

  if (status === "valid") {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
        <Check className="size-3.5" />
        Domain verified
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <p className="text-xs font-semibold leading-5 text-foreground">
        Could not verify that domain. Check the URL and try again.
      </p>
    );
  }

  return <p className="text-xs leading-5 text-muted-foreground">{message}</p>;
}

import { demoSourceEvents } from "./cliDemoData";
import { take } from "./cliListHelpers";
import {
  normalizeSourceEventInput,
  readSourceEventsFile,
  resolveInputPath,
  sourceEventInput,
  sourceKindFlag,
  sourceProviderFlag,
} from "./cliSourceEvents";
import type { CliContext } from "./cliTypes";

export async function sourceList(context: CliContext) {
  const provider = sourceProviderFlag(context.flags.provider);
  const kind = sourceKindFlag(context.flags.kind);
  if (context.flags.useDemo) {
    return {
      sourceEvents: take(
        demoSourceEvents.filter(
          (item) => (!provider || item.provider === provider) && (!kind || item.kind === kind),
        ),
        context.flags.limit,
      ),
    };
  }
  return {
    sourceEvents: await context.amend.sourceEvents({
      projectSlug: context.flags.projectSlug,
      provider,
      kind,
      limit: context.flags.limit,
    }),
  };
}

export async function sourceImport(context: CliContext) {
  const input = sourceEventInput(context.flags);
  const filePayload = context.flags.file
    ? readSourceEventsFile(resolveInputPath(context.cwd, context.flags.file))
    : undefined;

  if (context.flags.useDemo) {
    if (filePayload !== undefined) {
      if (Array.isArray(filePayload)) {
        return {
          mode: "demo",
          sourceEvents: filePayload.map((item) => normalizeSourceEventInput(item)),
          status: "validated",
          note: "Demo mode validates source-event file shape without contacting the API.",
        };
      }
      return {
        mode: "demo",
        sourceEvent: normalizeSourceEventInput(filePayload),
        status: "validated",
        note: "Demo mode validates source-event file shape without contacting the API.",
      };
    }
    return {
      mode: "demo",
      sourceEvent: input,
      status: "created",
      note: "Demo mode validates source-event shape without contacting the API.",
    };
  }

  if (filePayload !== undefined) {
    if (Array.isArray(filePayload)) {
      return {
        sourceEvents: await context.amend.importSourceEvents(
          filePayload.map((item) => normalizeSourceEventInput(item)),
        ),
      };
    }
    return {
      sourceEvent: await context.amend.importSourceEvent(normalizeSourceEventInput(filePayload)),
    };
  }

  return {
    sourceEvent: await context.amend.importSourceEvent(input),
  };
}

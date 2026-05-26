import {
  demoAgentRuns,
  demoBuildBriefs,
  demoChangelog,
  demoDecisions,
  demoFeedback,
  demoRoadmap,
  demoSourceEvents,
} from "./cliDemoData";
import { buildBriefStatus, filterStatus, take } from "./cliListHelpers";
import { asArray, asRecord } from "./cliOutput";
import type { CliContext } from "./cliTypes";

export async function status(context: CliContext) {
  if (context.flags.useDemo) {
    return {
      mode: "demo",
      endpoint: context.endpoint,
      project: context.project,
      tokenConfigured: Boolean(context.token),
      counts: {
        buildBriefs: demoBuildBriefs.length,
        changelog: demoChangelog.length,
        decisions: demoDecisions.length,
        feedback: demoFeedback.length,
        runs: demoAgentRuns.length,
        roadmap: demoRoadmap.length,
        sourceEvents: demoSourceEvents.length,
      },
    };
  }

  const [portal, decisions, buildBriefs] = await Promise.all([
    context.amend.portal(),
    context.token ? context.amend.automationDecisions() : Promise.resolve([]),
    context.amend.buildBriefs(),
  ]);
  const portalRecord = asRecord(portal);
  return {
    mode: "api",
    endpoint: context.endpoint,
    project: context.project,
    tokenConfigured: Boolean(context.token),
    counts: {
      buildBriefs: asArray(buildBriefs).length,
      changelog: asArray(portalRecord.changelog).length,
      decisions: asArray(decisions).length,
      feedback: asArray(portalRecord.feedback).length,
      roadmap: asArray(portalRecord.roadmap).length,
    },
  };
}

export async function feedbackList(context: CliContext) {
  if (context.flags.useDemo) {
    return { feedback: take(demoFeedback, context.flags.limit) };
  }
  const portal = asRecord(await context.amend.portal());
  return { feedback: take(asArray(portal.feedback), context.flags.limit) };
}

export async function requestSearch(context: CliContext) {
  const query = (context.flags.query ?? context.flags.args.slice(2).join(" ")).trim();
  const source = context.flags.useDemo
    ? demoFeedback
    : asArray(asRecord(await context.amend.portal()).feedback);
  const matches = source.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(query.toLowerCase()),
  );
  return { query, matches: take(matches, context.flags.limit) };
}

export async function briefsList(context: CliContext) {
  if (context.flags.useDemo) {
    return {
      buildBriefs: take(filterStatus(demoBuildBriefs, context.flags.status), context.flags.limit),
    };
  }
  return {
    buildBriefs: await context.amend.buildBriefs({
      status: buildBriefStatus(context.flags.status),
    }),
  };
}

export async function agentRun(context: CliContext) {
  if (context.flags.useDemo) {
    return {
      mode: "demo",
      decisions: demoDecisions,
      note: "Demo mode returns deterministic recommendations without provider keys.",
    };
  }
  return {
    mode: "read_only",
    decisions: await context.amend.automationDecisions(),
    note: "This command reads current recommendations. Triggering live automation remains dashboard/backend-owned.",
  };
}

export async function agentRuns(context: CliContext) {
  if (context.flags.useDemo) {
    return {
      runs: take(demoAgentRuns, context.flags.limit),
    };
  }
  return {
    runs: await context.amend.agentRuns(),
  };
}

export async function changelogDraft(context: CliContext) {
  const title = context.flags.title ?? "Source-linked update";
  if (context.flags.useDemo) {
    return {
      draft: {
        body: "GitHub evidence is linked to customer demand. Review the attached source links before publishing.",
        provider: "demo",
        sourceLinks: demoDecisions[0]?.sourceLinks ?? [],
        title,
      },
    };
  }
  return {
    draft: await context.amend.draftChangelog({
      dryRun: true,
      kind: "manual",
      title,
    }),
  };
}

export async function roadmapList(context: CliContext) {
  if (context.flags.useDemo) {
    return { roadmap: filterStatus(demoRoadmap, context.flags.status) };
  }
  return { roadmap: await context.amend.roadmap(context.flags.status) };
}

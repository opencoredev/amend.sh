import { assert, assertIncludes, check, read, readIntegrationDocs } from "./smoke-helpers";

export async function runSmokeProductBrandAndDocsChecks() {
  await check("brand kit artifacts exist", async () => {
    const brand = await read("docs/brand.md");
    const css = [
      await read("packages/ui/src/styles/globals.css"),
      await read("packages/ui/src/styles/theme.css"),
      await read("packages/ui/src/styles/base.css"),
      await read("packages/ui/src/styles/motion.css"),
      await read("packages/ui/src/styles/amend.css"),
    ].join("\n");
    const board = await read("apps/web/public/brand/amend-brand-board.svg");
    const mark = await read("apps/web/public/brand/amend-mark.svg");
    const lockup = await read("apps/web/public/brand/amend-lockup.svg");
    const favicon = await read("apps/web/public/favicon.svg");

    assertIncludes(brand, "Source to shipped story", "brand docs");
    assertIncludes(brand, "Implementation Sources", "brand docs");
    assertIncludes(brand, "amend-brand-board.svg", "brand docs");
    assertIncludes(board, "AMEND.SH / SOURCE TO STORY", "brand board");
    assertIncludes(mark, "<svg", "brand mark");
    assertIncludes(lockup, "<svg", "brand lockup");
    assertIncludes(favicon, "<svg", "favicon");
    assertIncludes(css, "--primary: oklch(0 0 0)", "brand theme tokens");
    assertIncludes(css, "--chart-2: oklch(0.7336 0.1758 50.5517)", "brand theme tokens");
  });

  await check("open-source license is explicit", async () => {
    const pkg = JSON.parse(await read("package.json")) as { license?: string };
    const license = await read("LICENSE");

    assert(pkg.license === "MIT", "root package license should be MIT");
    assertIncludes(license, "MIT License", "root license");
    assertIncludes(license, "Amend.sh contributors", "root license");
  });

  await check("integration docs cover product setup", async () => {
    const docs = await readIntegrationDocs();
    const agentSkill = await read("docs/agents/amend/SKILL.md");
    for (const heading of [
      "GitHub Setup",
      "Portal Setup",
      "SDK Install",
      "REST API",
      "Identity Mapping",
      "Side Panel / Embed",
      "Notification Rules",
      "Automation Rules",
      "Self-Hosting",
      "Bring Your Own AI Key",
    ]) {
      assertIncludes(docs, `## ${heading}`, "integration guide");
    }
    assertIncludes(docs, "amend init", "integration guide CLI config");
    assertIncludes(docs, "amend config show", "integration guide CLI config inspection");
    assertIncludes(docs, "permissions inspect", "integration guide CLI permissions inspection");
    assertIncludes(docs, ".amend/config.json", "integration guide CLI config");
    assertIncludes(docs, "source-events.csv", "integration guide source imports");
    assertIncludes(docs, "`external_id`", "integration guide source imports");
    assertIncludes(agentSkill, "config show", "agent skill CLI config inspection");
    assertIncludes(agentSkill, "permissions inspect", "agent skill CLI permissions inspection");
  });
}

import { Amend } from "../packages/sdk/src/index";
import { API_BASE_URL, WEB_URL, assert, assertIncludes, check, fetchText } from "./smoke-helpers";

export async function runSmokeRuntimeChecks() {
  await check("homepage renders through portless", async () => {
    const html = await fetchText(WEB_URL);
    assertIncludes(html, "Amend.sh", "homepage");
    assertIncludes(html, "Close the loop between", "homepage");
    assertIncludes(html, "feedback and shipped code.", "homepage");
    assertIncludes(html, "you know who needs the update.", "homepage");
    assert(
      !html.includes("Connect GitHub to the customers waiting on what shipped."),
      "homepage still contains the rejected old hero",
    );
    assert(
      !html.includes("Connect shipped work to waiting customers."),
      "homepage still contains the rejected replacement hero",
    );
    assert(
      !html.includes("Amend closes the loop when GitHub ships."),
      "homepage still contains the tall interim hero",
    );
    return WEB_URL;
  });

  await check("public portal renders through portless", async () => {
    const html = await fetchText(`${WEB_URL}/portal/amend-labs`);
    assertIncludes(html, "amend-labs - Amend public portal", "public portal");
    assertIncludes(html, "Source-linked changelog, roadmap", "public portal");
  });

  await check("embed demo renders through portless", async () => {
    const html = await fetchText(`${WEB_URL}/embed-demo`);
    assertIncludes(html, "Amend.sh embed demo", "embed demo");
    assertIncludes(html, "The portal inside your app.", "embed demo");
  });

  await check("REST portal API responds from Convex", async () => {
    const response = await fetch(`${API_BASE_URL}/amend-labs/portal`);
    assert(response.ok, `portal API returned ${response.status}`);
    const data = (await response.json()) as {
      changelog?: unknown[];
      roadmap?: unknown[];
      workspace?: { slug?: string };
    };

    assert(data.workspace?.slug === "amend-labs", "portal API returned the wrong workspace");
    assert(Array.isArray(data.roadmap) && data.roadmap.length > 0, "portal API has no roadmap");
    assert(
      Array.isArray(data.changelog) && data.changelog.length > 0,
      "portal API has no changelog",
    );
    return API_BASE_URL;
  });

  await check("REST user-specific updates respond from Convex", async () => {
    const response = await fetch(`${API_BASE_URL}/amend-labs/updates?externalUserId=smoke-user`);
    assert(response.ok, `updates API returned ${response.status}`);
    const data = (await response.json()) as {
      changelog?: unknown[];
      notifications?: unknown[];
      roadmap?: unknown[];
      seenUpdateKeys?: unknown[];
      user?: { externalUserId?: string };
    };

    assert(data.user?.externalUserId === "smoke-user", "updates API did not echo the user context");
    assert(Array.isArray(data.notifications), "updates API notifications are not an array");
    assert(Array.isArray(data.seenUpdateKeys), "updates API seen keys are not an array");
  });

  await check("TypeScript SDK reads the same portal and plans", async () => {
    const amend = new Amend({ apiBaseUrl: API_BASE_URL, project: "amend-labs" });
    const [portal, plans] = await Promise.all([amend.portal(), amend.plans()]);

    assert(portal.workspace?.slug === "amend-labs", "SDK portal returned the wrong workspace");
    assert(Array.isArray(portal.roadmap) && portal.roadmap.length > 0, "SDK portal has no roadmap");
    assert(
      Array.isArray(plans.plans) && plans.plans.length >= 6,
      "SDK plans catalog is incomplete",
    );
  });
}

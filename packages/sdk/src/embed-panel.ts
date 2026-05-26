import { AmendAgentClient } from "./agent-client";
import type { AmendFeedbackInput } from "./types";
import { loadAmendPanelData } from "./embed-data";
import type { AmendPanel, AmendPanelOptions } from "./embed-types";
import { panelShell, renderRoadmapItems, renderUpdateItems } from "./embed-template";

export function createAmendPanel(options: AmendPanelOptions): AmendPanel {
  const client = new AmendAgentClient(options);
  const host = document.createElement("aside");
  const shadow = host.attachShadow({ mode: "open" });
  const parent = options.container ?? document.body;

  host.setAttribute("data-amend-panel", options.project);
  host.style.position = "fixed";
  host.style.right = "18px";
  host.style.bottom = "18px";
  host.style.zIndex = "2147483640";

  shadow.innerHTML = panelShell(options.title ?? "Product updates");
  parent.append(host);

  const panel = shadow.querySelector<HTMLElement>("[data-panel]");
  const form = shadow.querySelector<HTMLFormElement>("form");
  const closeButton = shadow.querySelector<HTMLButtonElement>("[data-close]");
  const feedbackButton = shadow.querySelector<HTMLButtonElement>("[data-feedback]");

  async function refresh() {
    const data = await loadAmendPanelData(client, options.userId);
    const updates = shadow.querySelector<HTMLElement>("[data-updates]");
    const roadmap = shadow.querySelector<HTMLElement>("[data-roadmap]");
    if (updates) {
      updates.innerHTML = renderUpdateItems(data);
    }
    if (roadmap) {
      roadmap.innerHTML = renderRoadmapItems(data);
    }
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const input: AmendFeedbackInput = {
      authorEmail: String(formData.get("email") ?? ""),
      body: String(formData.get("body") ?? ""),
      sourceUrl: window.location.href,
      title: String(formData.get("title") ?? ""),
    };
    await client.submitRequest(input);
    form.reset();
    await refresh();
  });

  closeButton?.addEventListener("click", () => {
    if (panel) {
      panel.hidden = true;
    }
  });

  feedbackButton?.addEventListener("click", () => {
    shadow.querySelector<HTMLInputElement>("input[name='title']")?.focus();
  });

  void refresh();

  return {
    close: () => {
      if (panel) {
        panel.hidden = true;
      }
    },
    element: host,
    open: () => {
      if (panel) {
        panel.hidden = false;
      }
    },
    refresh,
  };
}

import { Amend, type AmendFeedbackInput } from "./index";

export type AmendPanelOptions = {
  apiBaseUrl?: string;
  container?: HTMLElement;
  fetch?: typeof fetch;
  project: string;
  title?: string;
  token?: string;
  userId?: string;
};

export type AmendPanel = {
  close: () => void;
  element: HTMLElement;
  open: () => void;
  refresh: () => Promise<void>;
};

type AmendPanelClient = Pick<Amend, "portal" | "updatesForUser">;

export async function loadAmendPanelData(client: AmendPanelClient, userId?: string) {
  return userId ? await client.updatesForUser(userId) : await client.portal();
}

export function createAmendPanel(options: AmendPanelOptions): AmendPanel {
  const client = new Amend(options);
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
      const notifications =
        data.notifications?.map((item: any) => ({
          detail: item.body,
          title: item.title,
        })) ?? [];
      updates.innerHTML = listItems(
        notifications.length > 0
          ? notifications.slice(0, 3)
          : (data.changelog?.slice(0, 3).map((item: any) => ({
              detail: item.summary ?? item.body,
              title: item.title,
            })) ?? []),
      );
    }
    if (roadmap) {
      roadmap.innerHTML = listItems(
        data.roadmap?.slice(0, 3).map((item: any) => ({
          detail: item.status,
          title: item.title,
        })) ?? [],
      );
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

function panelShell(title: string) {
  return `
    <style>
      :host {
        --amend-bg: Canvas;
        --amend-fg: CanvasText;
        --amend-muted: color-mix(in oklab, CanvasText 58%, transparent);
        --amend-line: color-mix(in oklab, CanvasText 14%, transparent);
        --amend-source: oklch(0.6217 0.2589 305.3090);
        --amend-gold: oklch(0.7336 0.1758 50.5517);
        color-scheme: light dark;
        font-family: Montserrat, ui-sans-serif, system-ui, sans-serif;
      }
      [data-panel] { width: min(380px, calc(100vw - 36px)); max-height: min(720px, calc(100vh - 36px)); overflow: auto; border: 1px solid var(--amend-line); background: var(--amend-bg); color: var(--amend-fg); box-shadow: 0 24px 70px rgb(0 0 0 / 0.22); }
      header { display: grid; grid-template-columns: 34px minmax(0, 1fr) 34px; align-items: center; gap: 10px; padding: 14px; border-bottom: 1px solid var(--amend-line); }
      [data-mark] { width: 30px; height: 30px; border: 1px solid var(--amend-line); display: grid; place-items: center; background: color-mix(in oklab, var(--amend-source) 9%, transparent); }
      [data-mark] svg { width: 20px; height: 20px; display: block; }
      [data-kicker] { display: block; margin-bottom: 2px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; line-height: 1; letter-spacing: .12em; text-transform: uppercase; color: var(--amend-muted); }
      h2, h3, p { margin: 0; }
      h2 { min-width: 0; overflow-wrap: anywhere; font-size: 15px; }
      h3 { font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: var(--amend-muted); }
      section { padding: 14px; border-bottom: 1px solid color-mix(in oklab, CanvasText 10%, transparent); }
      button, input, textarea { font: inherit; }
      button { border: 1px solid var(--amend-source); background: var(--amend-source); color: Canvas; min-height: 34px; padding: 0 10px; cursor: pointer; }
      [data-close] { background: transparent; color: var(--amend-fg); width: 34px; padding: 0; border-color: var(--amend-line); }
      ul { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; }
      li { border: 1px solid color-mix(in oklab, CanvasText 10%, transparent); padding: 10px; border-left: 3px solid var(--amend-source); }
      li:nth-child(even) { border-left-color: var(--amend-gold); }
      strong { display: block; overflow-wrap: anywhere; font-size: 13px; }
      small { color: var(--amend-muted); line-height: 1.5; overflow-wrap: anywhere; }
      form { display: grid; gap: 8px; margin-top: 10px; }
      input, textarea { width: 100%; box-sizing: border-box; border: 1px solid var(--amend-line); background: var(--amend-bg); color: var(--amend-fg); padding: 9px; }
      textarea { min-height: 80px; resize: vertical; }
    </style>
    <div data-panel>
      <header>
        <span data-mark>${amendMarkSvg()}</span>
        <div>
          <span data-kicker>source to story</span>
          <h2>${escapeHtml(title)}</h2>
        </div>
        <button data-close type="button" aria-label="Close Amend panel">×</button>
      </header>
      <section>
        <h3>What shipped</h3>
        <div data-updates><p>Loading updates…</p></div>
      </section>
      <section>
        <h3>Roadmap</h3>
        <div data-roadmap><p>Loading roadmap…</p></div>
      </section>
      <section>
        <h3>Request something</h3>
        <form>
          <input name="title" required placeholder="Short title" />
          <textarea name="body" required placeholder="What should change?" ></textarea>
          <input name="email" type="email" placeholder="Email for shipped updates" />
          <button data-feedback type="submit">Send request</button>
        </form>
      </section>
    </div>
  `;
}

function amendMarkSvg() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <path d="M16 44L44 16" fill="none" stroke="var(--amend-gold)" stroke-width="8" stroke-linecap="square"/>
    <path d="M16 20h18c8 0 14 6 14 14v10" fill="none" stroke="var(--amend-source)" stroke-width="8" stroke-linecap="square" stroke-linejoin="miter"/>
    <circle cx="16" cy="20" r="5" fill="var(--amend-source)"/>
    <circle cx="48" cy="44" r="5" fill="var(--amend-gold)"/>
  </svg>`;
}

function listItems(items: Array<{ detail?: string; title: string }>) {
  if (items.length === 0) {
    return "<p>No updates yet.</p>";
  }
  return `<ul>${items
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail ?? "")}</small></li>`,
    )
    .join("")}</ul>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '"': "&quot;",
      "&": "&amp;",
      "'": "&#39;",
      "<": "&lt;",
      ">": "&gt;",
    };
    return entities[char] ?? char;
  });
}

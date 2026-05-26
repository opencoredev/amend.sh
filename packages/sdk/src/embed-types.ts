import type { AmendClientOptions } from "./types";

export type AmendPanelOptions = AmendClientOptions & {
  container?: HTMLElement;
  title?: string;
  userId?: string;
};

export type AmendPanel = {
  close: () => void;
  element: HTMLElement;
  open: () => void;
  refresh: () => Promise<void>;
};

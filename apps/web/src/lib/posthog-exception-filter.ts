type ExceptionStackFrame = {
  in_app?: boolean;
};

type ExceptionListItem = {
  value?: string;
  stacktrace?: {
    frames?: ExceptionStackFrame[];
  };
};

// Browser extensions throw these WebExtension messaging errors inside the host
// page. posthog-js forwards them as unhandled exceptions even though they come
// from a visitor's extension, not from amend.sh.
const extensionApiMessagePattern =
  /\b(?:runtime|tabs)\.(?:sendMessage|connect|onMessage|onConnect)\b/i;

export function isThirdPartyExtensionException(properties: Record<string, unknown> | undefined) {
  const exceptionList = properties?.["$exception_list"];
  if (!Array.isArray(exceptionList) || exceptionList.length === 0) {
    return false;
  }

  let matchesExtensionApi = false;
  for (const item of exceptionList as ExceptionListItem[]) {
    const frames = item?.stacktrace?.frames;
    if (Array.isArray(frames) && frames.some((frame) => frame?.in_app === true)) {
      return false;
    }
    if (typeof item?.value === "string" && extensionApiMessagePattern.test(item.value)) {
      matchesExtensionApi = true;
    }
  }

  return matchesExtensionApi;
}

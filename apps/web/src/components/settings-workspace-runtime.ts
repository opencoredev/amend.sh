/** Build/runtime facts surfaced read-only in the General → System group. */
export const amendRuntimeVersion = import.meta.env.VITE_AMEND_VERSION ?? "0.1.0-beta";

export const amendRuntimeCommit =
  import.meta.env.VITE_AMEND_COMMIT_SHA ?? import.meta.env.VITE_AMEND_BUILD_SHA ?? "local";

export const amendUpdateCheckState =
  import.meta.env.VITE_AMEND_DISABLE_VERSION_CHECK === "1" ? "Disabled" : "CLI opt-in";

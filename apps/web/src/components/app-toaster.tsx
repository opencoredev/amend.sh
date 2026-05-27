import { Toaster } from "sileo";

import "sileo/styles.css";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      offset={{ right: 18, top: 18 }}
      theme="dark"
      options={{
        fill: "#111111",
        roundness: 12,
        styles: {
          badge: "bg-white/10!",
          button: "bg-white/10! text-white! hover:bg-white/15!",
          description: "text-white/70!",
          title: "text-white!",
        },
      }}
    />
  );
}

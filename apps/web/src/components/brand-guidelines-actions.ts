import { brandAssetDownloads } from "@/lib/brand-assets";

export function copySvg(svg: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    void navigator.clipboard.writeText(svg);
    return;
  }
  const input = document.createElement("textarea");
  input.value = svg;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function downloadSvg(filename: string, svg: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  link.click();
  URL.revokeObjectURL(link.href);
}

export function downloadBrandAssets() {
  brandAssetDownloads.forEach(([filename, svg], index) => {
    window.setTimeout(() => downloadSvg(filename, svg), index * 80);
  });
}

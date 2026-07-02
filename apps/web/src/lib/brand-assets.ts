export const amendMarkSvg = `<svg fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <title>Amend.sh mark</title>
  <path clip-rule="evenodd" d="M8 56 26.6 8h10.8L56 56H44.15l-3.6-9.7h-17.1l-3.6 9.7H8Zm20.35-20.2h7.3L32 24.6l-3.65 11.2Z" fill="currentColor" fill-rule="evenodd"/>
  <path d="M21.6 39.2h23.8L41.9 48H18.1l3.5-8.8Z" fill="#e19b40"/>
</svg>
`;

export const amendMarkLightSvg = `<svg fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <title>Amend.sh mark for light backgrounds</title>
  <path clip-rule="evenodd" d="M8 56 26.6 8h10.8L56 56H44.15l-3.6-9.7h-17.1l-3.6 9.7H8Zm20.35-20.2h7.3L32 24.6l-3.65 11.2Z" fill="#0d0c0a" fill-rule="evenodd"/>
  <path d="M21.6 39.2h23.8L41.9 48H18.1l3.5-8.8Z" fill="#e19b40"/>
</svg>
`;

export const amendMarkDarkSvg = `<svg fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <title>Amend.sh mark for dark backgrounds</title>
  <path clip-rule="evenodd" d="M8 56 26.6 8h10.8L56 56H44.15l-3.6-9.7h-17.1l-3.6 9.7H8Zm20.35-20.2h7.3L32 24.6l-3.65 11.2Z" fill="#f7f4ef" fill-rule="evenodd"/>
  <path d="M21.6 39.2h23.8L41.9 48H18.1l3.5-8.8Z" fill="#e19b40"/>
</svg>
`;

export const amendWordmarkSvg = `<svg fill="none" viewBox="0 0 232 64" xmlns="http://www.w3.org/2000/svg">
  <title>Amend.sh logo</title>
  <path clip-rule="evenodd" d="M8 56 26.6 8h10.8L56 56H44.15l-3.6-9.7h-17.1l-3.6 9.7H8Zm20.35-20.2h7.3L32 24.6l-3.65 11.2Z" fill="currentColor" fill-rule="evenodd"/>
  <path d="M21.6 39.2h23.8L41.9 48H18.1l3.5-8.8Z" fill="#e19b40"/>
  <text x="76" y="40" fill="currentColor" font-family="Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="24" font-weight="700" letter-spacing=".2">amend</text>
  <text x="162" y="40" fill="currentColor" font-family="Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="24" font-weight="700" letter-spacing=".2" opacity=".62">.sh</text>
</svg>
`;

export const amendWordmarkLightSvg = `<svg fill="none" viewBox="0 0 232 64" xmlns="http://www.w3.org/2000/svg">
  <title>Amend.sh logo for light backgrounds</title>
  <path clip-rule="evenodd" d="M8 56 26.6 8h10.8L56 56H44.15l-3.6-9.7h-17.1l-3.6 9.7H8Zm20.35-20.2h7.3L32 24.6l-3.65 11.2Z" fill="#0d0c0a" fill-rule="evenodd"/>
  <path d="M21.6 39.2h23.8L41.9 48H18.1l3.5-8.8Z" fill="#e19b40"/>
  <text x="76" y="40" fill="#0d0c0a" font-family="Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="24" font-weight="700" letter-spacing=".2">amend</text>
  <text x="162" y="40" fill="#6f6a64" font-family="Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="24" font-weight="700" letter-spacing=".2">.sh</text>
</svg>
`;

export const amendWordmarkDarkSvg = `<svg fill="none" viewBox="0 0 232 64" xmlns="http://www.w3.org/2000/svg">
  <title>Amend.sh logo for dark backgrounds</title>
  <path clip-rule="evenodd" d="M8 56 26.6 8h10.8L56 56H44.15l-3.6-9.7h-17.1l-3.6 9.7H8Zm20.35-20.2h7.3L32 24.6l-3.65 11.2Z" fill="#f7f4ef" fill-rule="evenodd"/>
  <path d="M21.6 39.2h23.8L41.9 48H18.1l3.5-8.8Z" fill="#e19b40"/>
  <text x="76" y="40" fill="#f7f4ef" font-family="Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="24" font-weight="700" letter-spacing=".2">amend</text>
  <text x="162" y="40" fill="#9d9488" font-family="Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="24" font-weight="700" letter-spacing=".2">.sh</text>
</svg>
`;

export const brandAssetDownloads = [
  ["logo.svg", amendWordmarkSvg],
  ["logo-light.svg", amendWordmarkLightSvg],
  ["logo-dark.svg", amendWordmarkDarkSvg],
  ["logo-mark.svg", amendMarkSvg],
  ["logo-mark-light.svg", amendMarkLightSvg],
  ["logo-mark-dark.svg", amendMarkDarkSvg],
] as const;

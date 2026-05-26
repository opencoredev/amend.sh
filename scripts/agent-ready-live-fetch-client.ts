export async function fetchText(
  url: string,
  userAgent = "Amend agent-ready live validator (+https://amend.sh/llms.txt)",
) {
  const response = await fetch(url, {
    headers: {
      "user-agent": userAgent,
    },
  });
  const body = await response.text();
  return { body, response };
}

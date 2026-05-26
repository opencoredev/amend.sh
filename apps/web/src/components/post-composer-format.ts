export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function highlightCode(input: string, language: string) {
  if (language === "json") {
    return highlightMatches(
      input,
      /("(?:\\.|[^"\\])*")(\s*:)?|\b(?:true|false|null)\b|-?\b\d+(?:\.\d+)?\b/g,
      (match) => {
        if (/":\s*$/.test(match)) return "token-key";
        if (match.startsWith('"')) return "token-string";
        if (/true|false|null/.test(match)) return "token-literal";
        return "token-number";
      },
    );
  }

  if (language === "sh") {
    return highlightMatches(
      input,
      /(#.*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(--?[a-zA-Z0-9-]+)|\b(?:bun|npm|git|cd|curl|export|echo|cat|rg)\b/g,
      (match) => {
        if (match.startsWith("#")) return "token-comment";
        if (match.startsWith("-")) return "token-flag";
        if (match.startsWith('"') || match.startsWith("'")) return "token-string";
        return "token-keyword";
      },
    );
  }

  return highlightMatches(
    input,
    /(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(?:const|let|var|function|return|import|from|export|type|interface|if|else|async|await|new|class|extends)\b|\b\d+(?:\.\d+)?\b/g,
    (match) => {
      if (match.startsWith("//") || match.startsWith("/*")) return "token-comment";
      if (match.startsWith('"') || match.startsWith("'") || match.startsWith("`")) {
        return "token-string";
      }
      if (/^\d/.test(match)) return "token-number";
      return "token-keyword";
    },
  );
}

function highlightMatches(input: string, regex: RegExp, classify: (match: string) => string) {
  let output = "";
  let cursor = 0;

  for (const match of input.matchAll(regex)) {
    const index = match.index ?? 0;
    output += escapeHtml(input.slice(cursor, index));
    output += `<span class="${classify(match[0])}">${escapeHtml(match[0])}</span>`;
    cursor = index + match[0].length;
  }

  output += escapeHtml(input.slice(cursor));
  return output;
}

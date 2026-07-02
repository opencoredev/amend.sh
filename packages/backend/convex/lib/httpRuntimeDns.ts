import { optionalString, record } from "./httpRuntimeScalars";

export async function verifyDomainTxt(domain: string, expectedTxt: string) {
  const response = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=TXT`,
    {
      headers: {
        Accept: "application/dns-json",
      },
    },
  );
  const payload = await response.json().catch(() => ({}));
  const answerList = record(payload)?.Answer;
  const answers = Array.isArray(answerList) ? answerList : [];
  return answers.some((answer: unknown) => {
    const data = optionalString(record(answer)?.data);
    return data?.replaceAll('"', "").includes(expectedTxt);
  });
}

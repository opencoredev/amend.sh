const metadataFile = Bun.file(".vercel/convex-preview.json");

if (!(await metadataFile.exists())) {
  throw new Error(".vercel/convex-preview.json was not created during the preview build.");
}

const metadata = (await metadataFile.json()) as {
  convexSiteUrl?: string;
};

if (!metadata.convexSiteUrl?.startsWith("https://")) {
  throw new Error("Convex preview metadata is missing a valid convexSiteUrl.");
}

const versionUrl = `${metadata.convexSiteUrl}/api/v1/version`;
let lastStatus = 0;
let lastBody = "";

for (let attempt = 1; attempt <= 10; attempt += 1) {
  const response = await fetch(versionUrl);
  lastStatus = response.status;
  lastBody = await response.text();

  if (response.ok) {
    console.log(`Convex preview HTTP actions are live at ${metadata.convexSiteUrl}.`);
    process.exit(0);
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
}

throw new Error(
  `Convex preview HTTP actions did not become ready at ${versionUrl}. Last response: ${lastStatus} ${lastBody}`,
);

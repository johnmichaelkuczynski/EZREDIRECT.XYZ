export function parseDomains(input: string): string[] {
  if (!input || !input.trim()) return [];

  // Split by line breaks, spaces, commas, or semicolons
  const rawDomains = input.split(/[\s,;]+/);

  const parsed = rawDomains
    .filter((d) => d.trim() !== "")
    .map((d) => {
      let normalized = d.toLowerCase().trim();
      
      // Strip http:// or https://
      normalized = normalized.replace(/^https?:\/\//, "");
      
      // Strip www.
      normalized = normalized.replace(/^www\./, "");
      
      // Strip trailing slashes
      normalized = normalized.replace(/\/+$/, "");
      
      // Basic extraction if they pasted a full URL path (e.g., example.com/path) -> just get the domain
      // We only want the domain part
      const slashIndex = normalized.indexOf("/");
      if (slashIndex !== -1) {
        normalized = normalized.substring(0, slashIndex);
      }

      return normalized;
    })
    .filter((d) => d.length > 0);

  return parsed;
}

export function generateDomainBlock(domain: string): string {
  return `==================================================
${domain}
==================================================

Authorized JavaScript origins

https://${domain}
https://www.${domain}

Authorized redirect URIs

https://${domain}/auth/google/callback
https://${domain}/api/auth/google/callback
https://www.${domain}/auth/google/callback
https://www.${domain}/api/auth/google/callback`;
}

export function generateAllBlocks(domains: string[]): string {
  return domains.map(generateDomainBlock).join("\n\n\n");
}

export function generateEmbedCode(domain: string) {
  return `
<iframe 
  src="${domain}/embed"
  style="width: 100%; height: 100vh; border: none; overflow: hidden;"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
`;
} 
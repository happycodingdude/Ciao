export async function isValidUrl(url: string): Promise<boolean> {
  if (!url) return;
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the response status is 200-299
  } catch (error) {
    return false; // URL is invalid or inaccessible
  }
}

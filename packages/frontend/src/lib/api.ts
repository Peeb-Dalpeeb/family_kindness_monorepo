export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, init);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Request to ${url} failed:`, error);
    return null;
  }
}

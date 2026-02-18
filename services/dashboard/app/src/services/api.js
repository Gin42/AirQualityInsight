export async function fetchFromApi(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error("API error");
    }

    return await response.json();
  } catch (error) {
    console.warn("Backend unreachable");
    return null; // graceful fallback
  }
}

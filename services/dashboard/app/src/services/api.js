export async function fetchFromApi(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorMessage = `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.warn("Backend unreachable:", error.message);
    return null;
  }
}

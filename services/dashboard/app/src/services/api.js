export async function fetchFromApi(url) {
  const jsonResponse = await fetch(url);

  if (!jsonResponse.ok) {
    throw new Error(`HTTP error! status: ${jsonResponse.status}`);
  }

  const response = await jsonResponse.json();

  if (!response || Object.keys(response).length === 0) {
    throw new Error("API returned an empty response");
  }

  return response;
}

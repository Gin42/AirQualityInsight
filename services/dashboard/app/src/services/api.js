export async function fetchFromApi(url, options = {}) {
  const jsonResponse = await fetch(url, options); // Pass options to fetch

  if (!jsonResponse.ok) {
    throw new Error(`HTTP error! status: ${jsonResponse.status}`);
  }

  console.log(jsonResponse);

  const response = await jsonResponse.json();

  if (!response || Object.keys(response).length === 0) {
    throw new Error("API returned an empty response");
  }

  return response;
}

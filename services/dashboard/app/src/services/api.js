async function fetchFromApi(url) {
  const jsonResponse = await fetch(url);

  if (!jsonResponse.ok) {
    throw new Error(`HTTP error! status: ${jsonResponse.status}`);
  }

  const response = await jsonResponse.json();
  if (!response) {
    throw new Error("API request failed");
  }

  return response;
}

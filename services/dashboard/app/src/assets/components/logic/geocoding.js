import { fetchFromApi } from "@/services/api";

export async function reverseGeocode(lat, lng) {
  const res = await fetchFromApi(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
  );

  const { road, house_number, city, country } = res.address || {};
  return [road, city, house_number, country].filter(Boolean).join(", ");
}

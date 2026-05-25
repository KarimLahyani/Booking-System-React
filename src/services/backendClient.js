async function request(path, options = {}) {
  const response = await fetch(`http://localhost:8000${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function sortHotelsByName(hotels) {
  return [...hotels].sort((a, b) => a.name.localeCompare(b.name));
}

function hotelMatchesSearch(hotel, searchText) {
  const text = searchText.trim().toLowerCase();
  if (!text) return true;

  return [hotel.name, hotel.description, hotel.info, hotel.city, hotel.address]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(text));
}

export async function getDeals() {
  return request("/deals");
}

export async function getPopularSearches() {
  return request("/popularSearches");
}

export async function searchHotels(searchText) {
  const text = searchText.trim();
  const query = text ? `?q=${encodeURIComponent(text)}` : "";
  const hotels = await request(`/hotels${query}`);
  return sortHotelsByName(hotels.filter((hotel) => hotelMatchesSearch(hotel, text)));
}

export async function getHotelById(hotelId) {
  return request(`/hotels/${hotelId}`);
}

export async function getReservations() {
  return request("/reservations");
}

export async function createReservation(reservation) {
  return request("/reservations", {
    method: "POST",
    body: JSON.stringify(reservation)
  });
}

export async function deleteReservation(reservationId) {
  return request(`/reservations/${reservationId}`, {
    method: "DELETE"
  });
}

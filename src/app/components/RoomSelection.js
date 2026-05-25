"use client";

import { useMemo, useState } from "react";
import ImageWithFallback from "./ImageWithFallback";

function getNightCount(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) return 1;
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
}

function buildGuestOptions(roomCount, maxGuestsPerRoom) {
  const maxGuests = Math.max(Number(roomCount) * Number(maxGuestsPerRoom), 1);
  return Array.from({ length: maxGuests }, (_, index) => index + 1);
}

export default function RoomSelection({ hotel, searchData, onStartPayment, onOpenImage }) {
  const todayStr = new Date().toISOString().split("T")[0];

  function getNextDay(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  }

  const [dates, setDates] = useState({
    checkInDate: searchData?.checkInDate || "",
    checkOutDate: searchData?.checkOutDate || ""
  });

  function handleCheckInChange(event) {
    const nextCheckIn = event.target.value;
    setDates((current) => {
      const updated = { ...current, checkInDate: nextCheckIn };
      if (nextCheckIn) {
        const nextDay = getNextDay(nextCheckIn);
        if (!current.checkOutDate || current.checkOutDate <= nextCheckIn) {
          updated.checkOutDate = nextDay;
        }
      }
      return updated;
    });
  }
  const [roomCounts, setRoomCounts] = useState(() => {
    const initial = {};
    const requestedRooms = Number(searchData?.roomCount) || 0;
    const requestedGuests = Number(searchData?.guestCount) || 0;
    let bestIndex = 0;

    hotel.roomTypes?.forEach((roomType, index) => {
      if (!bestIndex && roomType.guestCount * requestedRooms >= requestedGuests) {
        bestIndex = index;
      }
    });

    if (requestedRooms > 0) initial[bestIndex] = Math.min(requestedRooms, 4);
    return initial;
  });
  const [guestCounts, setGuestCounts] = useState(() => {
    const requestedGuests = Number(searchData?.guestCount) || 0;
    return requestedGuests ? { 0: requestedGuests } : {};
  });
  const [error, setError] = useState("");

  const nights = getNightCount(dates.checkInDate, dates.checkOutDate);
  const summary = useMemo(() => {
    let totalAmount = 0;
    let totalRooms = 0;
    let totalGuests = 0;
    const selectedRooms = [];

    hotel.roomTypes?.forEach((roomType, index) => {
      const roomCount = Number(roomCounts[index]) || 0;
      if (roomCount <= 0) return;

      const guestCount = Number(guestCounts[index]) || roomCount;
      const pricePerNight = Math.round(hotel.pricePerNight * roomType.multiplier);
      totalAmount += pricePerNight * roomCount * nights;
      totalRooms += roomCount;
      totalGuests += guestCount;
      selectedRooms.push({
        roomType: roomType.name,
        count: roomCount,
        guestCount
      });
    });

    return { totalAmount, totalRooms, totalGuests, selectedRooms };
  }, [guestCounts, hotel.pricePerNight, hotel.roomTypes, nights, roomCounts]);

  function updateRoomCount(index, value, maxGuestsPerRoom) {
    const nextRoomCount = Number(value);
    setRoomCounts((current) => ({ ...current, [index]: nextRoomCount }));
    setGuestCounts((current) => {
      const currentGuests = Number(current[index]) || nextRoomCount;
      const maxGuests = Math.max(nextRoomCount * maxGuestsPerRoom, 1);
      return { ...current, [index]: Math.min(currentGuests, maxGuests) };
    });
  }

  function continueToPayment() {
    if (!dates.checkInDate || !dates.checkOutDate || dates.checkOutDate <= dates.checkInDate) {
      setError("Please select valid check-in and check-out dates.");
      return;
    }

    if (!summary.selectedRooms.length) {
      setError("Please select at least one room to continue.");
      return;
    }

    setError("");
    onStartPayment({
      hotel,
      roomType: summary.selectedRooms.map((room) => `${room.count}x ${room.roomType}`).join(", "),
      roomCount: summary.totalRooms,
      guestCount: summary.totalGuests,
      checkInDate: dates.checkInDate,
      checkOutDate: dates.checkOutDate,
      totalAmount: summary.totalAmount
    });
  }

  return (
    <section className="mt-4">
      <table className="table room-selection-table bg-white-table">
        <tbody>
          <tr>
            <th className="text-center room-reservation-th" style={{ width: "30%" }}>Room Type</th>
            <th className="text-center room-reservation-th" style={{ width: "10%" }}>Conditions</th>
            <th className="text-center room-reservation-th" style={{ width: "10%" }}>Guests</th>
            <th className="text-center room-reservation-th" style={{ width: "15%" }}>Price per Night</th>
            <th className="text-center room-reservation-th" style={{ width: "15%" }}>Select Rooms & Guests</th>
            <th className="text-center room-reservation-th" style={{ width: "20%" }}>Summary</th>
          </tr>

          {hotel.roomTypes?.map((roomType, index) => {
            const roomCount = Number(roomCounts[index]) || 0;
            const guestOptions = buildGuestOptions(roomCount || 1, roomType.guestCount);
            const pricePerNight = Math.round(hotel.pricePerNight * roomType.multiplier);

            return (
              <tr key={roomType.name}>
                <td>
                  <button
                    className="border-0 bg-transparent p-0 w-100"
                    type="button"
                    onClick={() => onOpenImage(index % hotel.images.length)}
                  >
                    <ImageWithFallback
                      src={hotel.images?.[index % hotel.images.length] || hotel.mainImage}
                      alt={`${hotel.name} - ${roomType.name} photo ${(index % hotel.images.length) + 1}`}
                      className="booking-room-image"
                    />
                  </button>
                  <div className="room-info">
                    <h3>{roomType.name}</h3>
                    <p>{28 + index * 6}m2</p>
                    <div className="amenities">
                      <div className="room-amenities">Air conditioning</div>
                      <div className="room-amenities">TV</div>
                      <div className="room-amenities">LCD TV</div>
                      <div className="room-amenities">Wireless Internet</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="conditions">
                    <div className="room-conditions">Breakfast included</div>
                    <div className="room-conditions free-cancellation">FREE Cancellation</div>
                  </div>
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-1 mb-2">
                    {Array.from({ length: Math.min(roomType.guestCount, 4) }).map((_, iconIndex) => (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" key={iconIndex}>
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z" />
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      </svg>
                    ))}
                  </div>
                  <p>{roomType.guestCount} guest(s)</p>
                </td>
                <td className="text-center price-display-cell">
                  <p>TL {pricePerNight.toLocaleString("en-US")}</p>
                </td>
                <td className="text-center">
                  <div className="d-flex flex-column gap-2 align-items-center mx-auto" style={{ maxWidth: "140px" }}>
                    <div className="w-100">
                      <label className="small text-muted mb-1 d-block text-start">Rooms</label>
                      <select
                        className="form-select form-select-sm booking-room-count"
                        value={roomCount}
                        onChange={(event) => updateRoomCount(index, event.target.value, roomType.guestCount)}
                      >
                        {[0, 1, 2, 3, 4].map((count) => (
                          <option value={count} key={count}>{count} {count === 0? "" : "Room"}{count > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>
                    <div className={`w-100 guest-select-wrapper ${roomCount > 0 ? "" : "d-none"}`}>
                      <label className="small text-muted mb-1 d-block text-start">Guests</label>
                      <select
                        className="form-select form-select-sm booking-guest-count"
                        value={guestCounts[index] || roomCount || 1}
                        onChange={(event) => setGuestCounts((current) => ({ ...current, [index]: Number(event.target.value) }))}
                      >
                        {guestOptions.map((count) => (
                          <option value={count} key={count}>
                            {count} Guest{count > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </td>
                {index === 0 && (
                  <td className="room-summary-cell" rowSpan={hotel.roomTypes.length}>
                    <div className="cart-summary-card">
                      <div className="w-full">
                        <div className="mb-10">
                          <label className="summary-date-label">Check-in</label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={dates.checkInDate}
                            onChange={handleCheckInChange}
                            min={todayStr}
                            required
                          />
                        </div>
                        <div>
                          <label className="summary-date-label">Check-out</label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={dates.checkOutDate}
                            onChange={(event) => setDates((current) => ({ ...current, checkOutDate: event.target.value }))}
                            min={dates.checkInDate ? getNextDay(dates.checkInDate) : getNextDay(todayStr)}
                            required
                          />
                        </div>
                      </div>
                      <div className="summary-rooms-label">
                        {summary.totalRooms} Room(s) &bull; {summary.totalGuests} Guest(s) &bull; {nights} night(s)
                      </div>
                      <div className="summary-footer-box">
                        <div className="summary-price-label">Total Price</div>
                        <div className="summary-total-price">TL {summary.totalAmount.toLocaleString("en-US")}</div>
                        <div className="summary-tax-note">All taxes included</div>
                        {error && <div className="booking-invalid-feedback show mt-2">{error}</div>}
                      </div>
                      <button className="btn-book-now" type="button" onClick={continueToPayment}>Book Now</button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Button, Form } from "react-bootstrap";

const defaultForm = {
  searchText: "",
  checkInDate: "",
  checkOutDate: "",
  guestCount: "",
  roomCount: ""
};

export default function SearchBar({ onSearch, initialValues = defaultForm }) {
  const [formData, setFormData] = useState({ ...defaultForm, ...initialValues });
  const [error, setError] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  function getNextDay(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  }

  function handleCheckInChange(event) {
    const nextCheckIn = event.target.value;
    setFormData((current) => {
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

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function submitForm(event) {
    event.preventDefault();

    const missingField = Object.values(formData).some((value) => !String(value).trim());
    if (missingField) {
      setError("Please fill in all fields to search.");
      return;
    }

    if (formData.checkOutDate <= formData.checkInDate) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setError("");
    onSearch(formData);
  }

  return (
    <Form noValidate onSubmit={submitForm} className="search-bar-floating">
      <div className="search-bar-shell">
        <div className="search-bar-icon-column" aria-hidden="true">
          <span className="search-bar-icon" />
        </div>

        <Form.Group className="search-bar-group">
          <Form.Label className="search-bar-label">Hotel</Form.Label>
          <Form.Control
            className="search-bar-input"
            name="searchText"
            value={formData.searchText}
            onChange={updateField}
            placeholder="City, hotel name or keyword"
            required
          />
        </Form.Group>

        <Form.Group className="search-bar-group search-bar-group-wide">
          <Form.Label className="search-bar-label">Check-in/out</Form.Label>
          <div className="search-bar-inline-fields">
            <Form.Control
              className="search-bar-input"
              type="date"
              name="checkInDate"
              value={formData.checkInDate}
              onChange={handleCheckInChange}
              min={todayStr}
              required
            />
            <span className="search-bar-separator">-</span>
            <Form.Control
              className="search-bar-input"
              type="date"
              name="checkOutDate"
              value={formData.checkOutDate}
              onChange={updateField}
              min={formData.checkInDate ? getNextDay(formData.checkInDate) : getNextDay(todayStr)}
              required
            />
          </div>
        </Form.Group>

        <Form.Group className="search-bar-group">
          <Form.Label className="search-bar-label">Guests and rooms</Form.Label>
          <div className="search-bar-inline-fields">
            <Form.Select className="search-bar-select" name="guestCount" value={formData.guestCount} onChange={updateField} required>
              <option value="">Guests</option>
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <option value={count} key={count}>
                  {count} Guest{count > 1 ? "s" : ""}
                </option>
              ))}
            </Form.Select>
            <span className="search-bar-separator">,</span>
            <Form.Select className="search-bar-select" name="roomCount" value={formData.roomCount} onChange={updateField} required>
              <option value="">Rooms</option>
              {[1, 2, 3, 4].map((count) => (
                <option value={count} key={count}>
                  {count} Room{count > 1 ? "s" : ""}
                </option>
              ))}
            </Form.Select>
          </div>
        </Form.Group>

        <div className="search-bar-button-column">
          <Button className="search-bar-button" type="submit">
            Search
          </Button>
        </div>
      </div>

      {error && <div className="search-global-error mt-3">{error}</div>}
    </Form>
  );
}

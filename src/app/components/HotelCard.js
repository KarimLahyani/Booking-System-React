"use client";

import { Card } from "react-bootstrap";
import ImageWithFallback from "./ImageWithFallback";

export default function HotelCard({ hotel, onSelect, compact = false }) {
  if (compact) {
    return (
      <button
        className="card hotel-card clickable-card shadow-sm border-0 h-100 text-start w-100 hotel-preview-button p-0 overflow-hidden"
        type="button"
        onClick={() => onSelect(hotel.id)}
      >
        <ImageWithFallback src={hotel.mainImage} alt={hotel.name} className="card-img-top" />
        <div className="card-body">
          <h3 className="h6 card-title mb-1">{hotel.name}</h3>
          <p className="mb-1 text-secondary small">{hotel.city}</p>
          <p className="mb-0 fw-semibold text-primary small">
            TL {Number(hotel.pricePerNight).toLocaleString("en-US")} / night
          </p>
        </div>
      </button>
    );
  }

  return (
    <Card
      as="button"
      className="hotel-card clickable-card shadow-sm border-0 text-start w-100 hotel-result-button p-0 overflow-hidden"
      onClick={() => onSelect(hotel.id)}
    >
      <ImageWithFallback src={hotel.mainImage} alt={hotel.name} className="card-img-top" />
      <Card.Body>
        <h3 className="h5 card-title">{hotel.name}</h3>
        <p className="mb-1 text-secondary">{hotel.city}</p>
        <p className="mb-1 small text-secondary">{hotel.address}</p>
        <p className="mb-1 small text-muted">
          Stars: {hotel.starCount} | Rating: {hotel.rating}
        </p>
        <p className="mb-0 fw-semibold text-primary">
          TL {Number(hotel.pricePerNight).toLocaleString("en-US")} / night
        </p>
      </Card.Body>
    </Card>
  );
}

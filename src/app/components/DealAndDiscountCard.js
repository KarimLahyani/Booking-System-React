"use client";

import { Card } from "react-bootstrap";
import ImageWithFallback from "./ImageWithFallback";

export default function DealAndDiscountCard({ deal }) {
  return (
    <Card className="offer-card h-100 border-0 rounded-4 shadow-sm overflow-hidden">
      <ImageWithFallback src={deal.imageUrl} alt={deal.title} className="card-img-top" />
      <Card.Body className="d-flex flex-column">
        <div className="d-flex flex-wrap gap-2 mb-2">
          <span className="deal-chip deal-chip-green">{deal.chip}</span>
          <span className="deal-chip deal-chip-red">{deal.badge}</span>
        </div>
        <h3 className="card-title h6 fw-bold mb-2">{deal.title}</h3>
        <p className="small text-secondary mb-3 flex-grow-1">{deal.details}</p>
        <button className="btn btn-link link-primary text-decoration-none text-uppercase fw-semibold small p-0 align-self-start" type="button">
          Learn more
        </button>
      </Card.Body>
    </Card>
  );
}

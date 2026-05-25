"use client";

import { Col, Row } from "react-bootstrap";
import HotelCard from "./HotelCard";

export default function SearchResults({ hotels, onSelectHotel }) {
  if (!hotels.length) {
    return <p className="text-secondary mb-0">No hotels found. Try another destination or keyword.</p>;
  }

  return (
    <Row className="g-4 row-cols-1 row-cols-sm-2 row-cols-lg-4">
      {hotels.map((hotel) => (
        <Col key={hotel.id}>
          <HotelCard hotel={hotel} onSelect={onSelectHotel} />
        </Col>
      ))}
    </Row>
  );
}

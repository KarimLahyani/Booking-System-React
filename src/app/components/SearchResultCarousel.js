"use client";

import { Carousel, Col, Row } from "react-bootstrap";
import HotelCard from "./HotelCard";

function chunkItems(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export default function SearchResultCarousel({ hotels, onSelectHotel }) {
  const slides = chunkItems(hotels, 5);

  if (!hotels.length) {
    return <p className="text-secondary mb-0">No hotels found for this search.</p>;
  }

  return (
    <Carousel className="simple-carousel" indicators={false}>
      {slides.map((slide, index) => (
        <Carousel.Item key={index}>
          <Row className="g-3 row-cols-1 row-cols-md-3 row-cols-xl-5">
            {slide.map((hotel) => (
              <Col key={hotel.id}>
                <HotelCard hotel={hotel} onSelect={onSelectHotel} compact />
              </Col>
            ))}
          </Row>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

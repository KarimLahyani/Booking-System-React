"use client";

import { Carousel, Col, Row } from "react-bootstrap";
import PopularSearchCard from "./PopularSearchCard";

function chunkItems(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export default function PopularSearches({ popularSearches, onSelect }) {
  const slides = chunkItems(popularSearches, 4);

  return (
    <Carousel className="simple-carousel" indicators={false}>
      {slides.map((slide, index) => (
        <Carousel.Item key={index}>
          <Row className="g-3">
            {slide.map((item) => (
              <Col md={6} xl={3} key={item.id}>
                <PopularSearchCard item={item} onSelect={onSelect} />
              </Col>
            ))}
          </Row>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

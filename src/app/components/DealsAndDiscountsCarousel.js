"use client";

import { Carousel, Col, Row } from "react-bootstrap";
import DealAndDiscountCard from "./DealAndDiscountCard";

function chunkItems(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export default function DealsAndDiscountsCarousel({ deals }) {
  const slides = chunkItems(deals, 4);

  return (
    <Carousel className="simple-carousel" indicators={false}>
      {slides.map((slide, index) => (
        <Carousel.Item key={index}>
          <Row className="g-3">
            {slide.map((deal) => (
              <Col md={6} xl={3} key={deal.id}>
                <DealAndDiscountCard deal={deal} />
              </Col>
            ))}
          </Row>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { Alert, Button, Carousel, Col, Modal, Row, Spinner } from "react-bootstrap";
import { getHotelById } from "@/services/backendClient";
import ImageWithFallback from "./ImageWithFallback";
import RoomSelection from "./RoomSelection";

function chunkItems(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export default function HotelDetail({ hotelId, searchData, onStartPayment }) {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRooms, setShowRooms] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const roomSelectionRef = useRef(null);

  useEffect(() => {
    if (showRooms && roomSelectionRef.current) {
      setTimeout(() => {
        roomSelectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [showRooms]);

  function handleBookNowClick() {
    if (!showRooms) {
      setShowRooms(true);
    } else {
      roomSelectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  useEffect(() => {
    async function loadHotel() {
      try {
        setLoading(true);
        setError("");
        const hotelData = await getHotelById(hotelId);
        setHotel(hotelData);
      } catch (requestError) {
        setError("Hotel details could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadHotel();
  }, [hotelId]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!hotel) {
    return <Alert variant="warning">Hotel was not found.</Alert>;
  }

  const hotelImages = hotel.images?.length ? hotel.images : [hotel.mainImage];
  const currentImage = currentImageIndex === null ? "" : hotelImages[currentImageIndex];

  function openLightbox(index) {
    setCurrentImageIndex(index);
  }

  function closeLightbox() {
    setCurrentImageIndex(null);
  }

  function showPreviousImage() {
    setCurrentImageIndex((current) => (current - 1 + hotelImages.length) % hotelImages.length);
  }

  function showNextImage() {
    setCurrentImageIndex((current) => (current + 1) % hotelImages.length);
  }

  return (
    <section>
      <div className="bg-white border shadow-sm p-3 p-lg-4 hotel-header-container">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
          <div>
            <h2 className="fw-bolder mb-2 hotel-header-title">{hotel.name}</h2>
            <div className="d-flex align-items-center small mt-1 hotel-header-location">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-1 text-primary" viewBox="0 0 16 16">
                <path d="M8 0a5.53 5.53 0 0 0-5.5 5.5c0 3.3 5 9.77 5.25 10.07a.33.33 0 0 0 .5 0C8.5 15.27 13.5 8.8 13.5 5.5A5.53 5.53 0 0 0 8 0zm0 7.5a2 2 0 1 1 2-2 2 2 0 0 1-2 2z" />
              </svg>
              <span>{hotel.city}, {hotel.address}</span>
              <span className="mx-2 text-muted">-</span>
              <a href="#" className="text-decoration-none fw-bold text-primary">Show on Map</a>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3 hotel-details-actions">
            <button className="btn btn-light rounded-circle shadow-sm border action-icon-btn" type="button" aria-label="Share hotel">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <button className="btn btn-light rounded-circle shadow-sm border action-icon-btn" type="button" aria-label="Save hotel">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <Button className="px-4 py-2 ms-2 fw-bold btn-book-now-header" onClick={handleBookNowClick}>
              Book now
            </Button>
          </div>
        </div>

        <Carousel className="simple-carousel mb-4" indicators={true} interval={3000} pause="hover">
          {chunkItems(hotelImages, 4).map((slide, slideIndex) => (
            <Carousel.Item key={slideIndex}>
              <Row className="g-3">
                {slide.map((image, imageIndex) => {
                  const absoluteIndex = slideIndex * 4 + imageIndex;
                  return (
                    <Col xs={6} lg={3} key={image}>
                      <button
                        className="position-relative rounded-4 overflow-hidden border-0 bg-transparent p-0 w-100"
                        type="button"
                        onClick={() => openLightbox(absoluteIndex)}
                      >
                        <ImageWithFallback
                          src={image}
                          alt={`${hotel.name} photo ${absoluteIndex + 1}`}
                          className="hotel-strip-image d-block w-100"
                        />
                      </button>
                    </Col>
                  );
                })}
              </Row>
            </Carousel.Item>
          ))}
        </Carousel>

        <Row className="g-3">
          <Col lg={7}>
            <div className="h-100 border border-primary-subtle rounded-4 bg-white p-4">
              <h3 className="h5 fw-bold mb-3">About the property</h3>
              <p className="mb-3 text-secondary">{hotel.description}</p>
              <p className="mb-3 text-secondary">{hotel.info}</p>
              <p className="mb-3 text-secondary">Location: {hotel.address}.</p>
              <p className="mb-0 text-secondary">
                Reservation summary: {searchData.checkInDate} to {searchData.checkOutDate} for {searchData.guestCount} guest(s).
              </p>
            </div>
          </Col>
          <Col lg={5}>
            <div className="h-100 border border-primary-subtle rounded-4 bg-white p-4">
              <h3 className="h5 fw-bold mb-3">Hotel policies</h3>
              <div className="mb-3">
                <h4 className="h6 fw-bold mb-1">Check-in</h4>
                <p className="mb-0 text-secondary">{hotel.rules?.[0] || "After 14:00"}</p>
              </div>
              <div className="mb-3">
                <h4 className="h6 fw-bold mb-1">Check-out</h4>
                <p className="mb-0 text-secondary">{hotel.rules?.[1] || "Before 12:00"}</p>
              </div>
              <div className="mb-3">
                <h4 className="h6 fw-bold mb-1">Price</h4>
                <p className="mb-0 text-secondary">TL {Number(hotel.pricePerNight).toLocaleString("en-US")} / night</p>
              </div>
              <div className="mb-3">
                <h4 className="h6 fw-bold mb-1">Reviews</h4>
                <p className="mb-0 text-secondary">{hotel.rating} / 10 from {hotel.ratingCount} review(s)</p>
              </div>
              <div>
                <h4 className="h6 fw-bold mb-2 text-dark">Hotel Stars</h4>
                <div className="d-flex gap-1 text-warning">
                  {Array.from({ length: hotel.starCount || 0 }).map((_, index) => (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" key={index}>
                      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {showRooms && (
        <div ref={roomSelectionRef}>
          <RoomSelection
            hotel={hotel}
            searchData={searchData}
            onStartPayment={onStartPayment}
            onOpenImage={openLightbox}
          />
        </div>
      )}

      <Modal
        id="imageLightboxModal"
        show={currentImageIndex !== null}
        onHide={closeLightbox}
        centered
        size="xl"
        contentClassName="border-0 bg-transparent"
      >
        <Modal.Header className="border-0 p-0 position-absolute end-0 top-0 z-3">
          <button type="button" className="btn btn-light rounded-circle p-2 m-3 shadow-sm" onClick={closeLightbox} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </Modal.Header>
        <Modal.Body className="p-0 text-center position-relative">
          <button id="lightboxPrevBtn" className="btn btn-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-3 shadow-sm z-3" type="button" aria-label="Previous image" onClick={showPreviousImage}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <ImageWithFallback id="lightboxImage" src={currentImage} className="img-fluid rounded-4 shadow-lg mx-auto" alt={`${hotel.name} photo ${currentImageIndex + 1}`} />

          <button id="lightboxNextBtn" className="btn btn-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-3 shadow-sm z-3" type="button" aria-label="Next image" onClick={showNextImage}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 text-white p-2">
            <span id="lightboxIndex" className="fw-bold fs-5 shadow-sm px-3 py-1 bg-dark bg-opacity-50 rounded-pill">
              {currentImageIndex === null ? "" : `${currentImageIndex + 1} / ${hotelImages.length}`}
            </span>
          </div>
        </Modal.Body>
      </Modal>
    </section>
  );
}

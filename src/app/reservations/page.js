"use client";

import { useEffect, useState } from "react";
import { Alert, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { deleteReservation, getReservations, searchHotels } from "@/services/backendClient";
import ImageWithFallback from "../components/ImageWithFallback";


export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPageData() {
      try {
        setLoading(true);
        setError("");
        const [reservationsData, hotelsData] = await Promise.all([
          getReservations(),
          searchHotels("")
        ]);
        setReservations(reservationsData);
        setHotels(hotelsData);
      } catch (requestError) {
        setError("Reservations could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, []);

  async function removeReservation(reservationId) {
    if (!window.confirm("Are you sure you want to delete this reservation?")) {
      return;
    }

    try {
      await deleteReservation(reservationId);
      setReservations((current) => current.filter((reservation) => reservation.id !== reservationId));
    } catch (requestError) {
      setError("Reservation could not be deleted.");
    }
  }

  // Create mapping of hotel name to main image
  const hotelImageMap = {};
  hotels.forEach((hotel) => {
    hotelImageMap[hotel.name] = hotel.mainImage;
  });

  return (
    <main className="reservations-page py-5">
      <Container>
        <div className="section-heading mb-4">
          <h1 className="h2 fw-bold text-dark">My Reservations</h1>
          <p className="text-secondary">View and manage your upcoming stays</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : reservations.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-4 text-center p-5">
            <Card.Body>
              <div className="mb-3 text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
              </div>
              <h3 className="h5 fw-bold mb-2">No Reservations Found</h3>
              <p className="text-secondary mb-0">You do not have any active hotel bookings at the moment.</p>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            {reservations.map((reservation) => (
              <Col md={6} xl={4} key={reservation.id}>
                <Card className="reservation-card border-0 rounded-4 shadow-sm overflow-hidden h-100 position-relative">
                  <div className="position-relative">
                    <ImageWithFallback
                      src={hotelImageMap[reservation.hotel.name] || "/images/city.png"}
                      alt={reservation.hotel.name}
                      style={{ height: "180px", width: "100%", objectFit: "cover" }}
                    />
                    <button
                      className="btn btn-danger position-absolute top-0 end-0 m-3 rounded-3 shadow-sm d-flex align-items-center justify-content-center p-2 border-0 delete-reservation-btn"
                      onClick={() => removeReservation(reservation.id)}
                      style={{ width: "36px", height: "36px" }}
                      aria-label="Delete reservation"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </button>
                  </div>
                  <Card.Body className="d-flex flex-column p-4">
                    <div className="mb-3">
                      <Card.Title className="h5 fw-bold text-dark mb-1">{reservation.hotel.name}</Card.Title>
                      <Card.Text className="text-muted small d-flex align-items-center mb-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="me-1 text-primary" viewBox="0 0 16 16">
                          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                        </svg>
                        {reservation.hotel.address}
                      </Card.Text>
                    </div>

                    <div className="bg-light rounded-3 p-3 border mb-3 flex-grow-1">
                      <div className="mb-2">
                        <span className="text-secondary small d-block">Primary Guest</span>
                        <span className="fw-semibold text-dark">{reservation.guestData.firstName} {reservation.guestData.lastName}</span>
                      </div>
                      <Row className="g-2 text-dark small border-top pt-2 mt-2">
                        <Col xs={6}>
                          <span className="text-secondary d-block">Check-In</span>
                          <span className="fw-semibold">{reservation.reservationData.checkInDate}</span>
                        </Col>
                        <Col xs={6}>
                          <span className="text-secondary d-block">Check-Out</span>
                          <span className="fw-semibold">{reservation.reservationData.checkOutDate}</span>
                        </Col>
                        <Col xs={6} className="mt-2">
                          <span className="text-secondary d-block">Room Details</span>
                          <span className="fw-semibold">{reservation.reservationData.roomType}</span>
                        </Col>
                        <Col xs={6} className="mt-2">
                          <span className="text-secondary d-block">Rooms & Guests</span>
                          <span className="fw-semibold">{reservation.reservationData.roomCount} Room(s) / {reservation.reservationData.guestCount} Guest(s)</span>
                        </Col>
                      </Row>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                      <span className="text-secondary small">Total Paid</span>
                      <span className="h4 fw-bold text-primary mb-0">
                        TL {Number(reservation.paymentInformation.totalAmount).toLocaleString("en-US")}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </main>
  );
}

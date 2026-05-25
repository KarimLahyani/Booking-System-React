"use client";

import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { createReservation } from "@/services/backendClient";

const emptyPaymentForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  cardNumber: "",
  cardName: "",
  expiryDate: "",
  cvc: "",
  paymentMethod: "Credit Card"
};

export default function Payment({ reservationData, onCompleted }) {
  const [formData, setFormData] = useState(emptyPaymentForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function validateForm() {
    const missingField = Object.values(formData).some((value) => !String(value).trim());
    if (missingField) return "All payment and guest fields are required.";
    if (!formData.email.includes("@")) return "Please enter a valid email address.";
    if (!/^\d{10,15}$/.test(formData.phone)) return "Please enter a valid phone number.";
    if (!/^\d{16}$/.test(formData.cardNumber)) return "Please enter a valid 16-digit card number.";
    if (!/^\d{3}$/.test(formData.cvc)) return "CVC must be 3 digits.";
    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) return "Expiry date must use MM/YY format.";
    return "";
  }

  async function submitPayment(event) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const reservation = {
      hotel: {
        name: reservationData.hotel.name,
        address: reservationData.hotel.address
      },
      reservationData: {
        roomCount: Number(reservationData.roomCount),
        guestCount: Number(reservationData.guestCount),
        roomType: reservationData.roomType,
        checkInDate: reservationData.checkInDate,
        checkOutDate: reservationData.checkOutDate
      },
      guestData: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      },
      paymentInformation: {
        cardInfo: {
          cardNumber: formData.cardNumber,
          cardHolder: formData.cardName,
          expiryDate: formData.expiryDate,
          cvv: formData.cvc
        },
        paymentMethod: formData.paymentMethod,
        totalAmount: Number(reservationData.totalAmount)
      },
      createdAt: new Date().toISOString()
    };

    try {
      setSaving(true);
      setError("");
      await createReservation(reservation);
      setFormData(emptyPaymentForm);
      alert("Reservation completed successfully.");
      onCompleted();
    } catch (requestError) {
      setError("Reservation could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="py-5">
      <Row className="g-4">
        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h2 className="h5 mb-3">Booking Summary</h2>
              <h3 className="h5">{reservationData.hotel.name}</h3>
              <p className="text-secondary small">{reservationData.hotel.address}</p>
              <hr />
              <p className="mb-1"><strong>Room Type:</strong> {reservationData.roomType}</p>
              <p className="mb-1"><strong>Room Count:</strong> {reservationData.roomCount}</p>
              <p className="mb-1"><strong>Guest Count:</strong> {reservationData.guestCount}</p>
              <p className="mb-1"><strong>Check-in:</strong> {reservationData.checkInDate}</p>
              <p className="mb-1"><strong>Check-out:</strong> {reservationData.checkOutDate}</p>
              <p className="mb-0 fw-semibold"><strong>Total Amount:</strong> TL {Number(reservationData.totalAmount).toLocaleString("en-US")}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h2 className="h5 mb-3">Guest and Payment Information</h2>
              <Form className="payment-form needs-validation" onSubmit={submitPayment}>
                <Row className="g-3">
                  <h3>Your Reservation Information</h3>
                  <Col md={6}>
                    <Form.Label>Your Name *</Form.Label>
                    <Form.Control name="firstName" placeholder="First Name" value={formData.firstName} onChange={updateField} required />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Your Surname *</Form.Label>
                    <Form.Control name="lastName" placeholder="Last Name" value={formData.lastName} onChange={updateField} required />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Your Email Address *</Form.Label>
                    <Form.Control type="email" name="email" placeholder="Email" value={formData.email} onChange={updateField} required />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="phone-input">Your Phone Number *</Form.Label>
                    <Form.Control name="phone" placeholder="555 555 55 55" value={formData.phone} onChange={updateField} required />
                  </Col>
                  <h3>Payment Options</h3>
                  <Col xs={12} className="mb-3">
                    <Form.Label className="d-block">Payment Method *</Form.Label>
                    <Form.Check
                      inline
                      type="radio"
                      name="paymentMethod"
                      label="Credit Card"
                      value="Credit Card"
                      checked={formData.paymentMethod === "Credit Card"}
                      onChange={updateField}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      name="paymentMethod"
                      label="Debit Card"
                      value="Debit Card"
                      checked={formData.paymentMethod === "Debit Card"}
                      onChange={updateField}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Name on the card *</Form.Label>
                    <Form.Control name="cardName" placeholder="Name on the card" value={formData.cardName} onChange={updateField} required />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Card Number *</Form.Label>
                    <Form.Control name="cardNumber" placeholder="Card Number" value={formData.cardNumber} onChange={updateField} required />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Expiration Date *</Form.Label>
                    <Form.Control name="expiryDate" placeholder="MM/YY" value={formData.expiryDate} onChange={updateField} required />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Security Number *</Form.Label>
                    <Form.Control name="cvc" placeholder="CVC" value={formData.cvc} onChange={updateField} required />
                  </Col>
                </Row>

                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                <div className="pt-4 d-grid d-md-flex justify-content-md-end">
                  <Button variant="success" className="px-4" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Complete the Booking"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  );
}

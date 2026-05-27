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
  const [validated, setValidated] = useState(false);

  function updateField(event) {
    let { name, value } = event.target;

    if (["firstName", "lastName", "cardName"].includes(name)) {
      value = value.replace(/\d/g, "");
    }

    if (["cardNumber", "cvc", "phone"].includes(name)) {
      value = value.replace(/\D/g, "");
      if (name === "cardNumber") value = value.substring(0, 16);
      if (name === "cvc") value = value.substring(0, 3);
      if (name === "phone") value = value.substring(0, 15);
    }

    if (name === "expiryDate") {
      let val = value.replace(/\D/g, "");
      if (val.length > 2) {
        val = val.substring(0, 2) + "/" + val.substring(2, 4);
      } else {
        val = val.substring(0, 2);
      }
      value = val;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  }

  const errors = {
    firstName: !formData.firstName.trim() ? "First name is required." : "",
    lastName: !formData.lastName.trim() ? "Last name is required." : "",
    email: !formData.email.trim() ? "Please enter a valid email address." : (!formData.email.includes("@") ? "Please enter a valid email address." : ""),
    phone: !formData.phone.trim() ? "Please enter a valid phone number." : (!/^\d{10,15}$/.test(formData.phone) ? "Please enter a valid phone number." : ""),
    cardName: !formData.cardName.trim() ? "Cardholder name is required." : "",
    cardNumber: !formData.cardNumber.trim() ? "Please enter a valid 16-digit card number." : (!/^\d{16}$/.test(formData.cardNumber) ? "Please enter a valid 16-digit card number." : ""),
    expiryDate: !formData.expiryDate.trim() 
      ? "Please enter a valid future expiration date (MM/YY)." 
      : (() => {
          if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) return "Please enter a valid future expiration date (MM/YY).";
          const [m, y] = formData.expiryDate.split("/").map(Number);
          if (m < 1 || m > 12) return "Please enter a valid future expiration date (MM/YY).";
          const now = new Date();
          const curM = now.getMonth() + 1;
          const curY = now.getFullYear() % 100;
          if (y < curY || (y === curY && m < curM)) return "Please enter a valid future expiration date (MM/YY).";
          return "";
        })(),
    cvc: !formData.cvc.trim() ? "Please enter a valid 3-digit CVC." : (!/^\d{3}$/.test(formData.cvc) ? "Please enter a valid 3-digit CVC." : "")
  };

  async function submitPayment(event) {
    event.preventDefault();
    setValidated(true);

    const hasErrors = Object.values(errors).some((err) => err !== "");
    if (hasErrors) {
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
      setValidated(false);
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
                    <Form.Control
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={updateField}
                      isValid={validated && !errors.firstName}
                      isInvalid={validated && !!errors.firstName}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Your Surname *</Form.Label>
                    <Form.Control
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={updateField}
                      isValid={validated && !errors.lastName}
                      isInvalid={validated && !!errors.lastName}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Your Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={updateField}
                      isValid={validated && !errors.email}
                      isInvalid={validated && !!errors.email}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Col>
                  <Col md={6}>
                    <Form.Label className="phone-input">Your Phone Number *</Form.Label>
                    <Form.Control
                      name="phone"
                      placeholder="555 555 55 55"
                      value={formData.phone}
                      onChange={updateField}
                      isValid={validated && !errors.phone}
                      isInvalid={validated && !!errors.phone}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
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
                    <Form.Control
                      name="cardName"
                      placeholder="Name on the card"
                      value={formData.cardName}
                      onChange={updateField}
                      isValid={validated && !errors.cardName}
                      isInvalid={validated && !!errors.cardName}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.cardName}
                    </Form.Control.Feedback>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Card Number *</Form.Label>
                    <Form.Control
                      name="cardNumber"
                      placeholder="Card Number"
                      value={formData.cardNumber}
                      onChange={updateField}
                      isValid={validated && !errors.cardNumber}
                      isInvalid={validated && !!errors.cardNumber}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.cardNumber}
                    </Form.Control.Feedback>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Expiration Date *</Form.Label>
                    <Form.Control
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={updateField}
                      isValid={validated && !errors.expiryDate}
                      isInvalid={validated && !!errors.expiryDate}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.expiryDate}
                    </Form.Control.Feedback>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Security Number *</Form.Label>
                    <Form.Control
                      name="cvc"
                      placeholder="CVC"
                      value={formData.cvc}
                      onChange={updateField}
                      isValid={validated && !errors.cvc}
                      isInvalid={validated && !!errors.cvc}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.cvc}
                    </Form.Control.Feedback>
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

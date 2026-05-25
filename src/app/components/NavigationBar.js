"use client";

import Link from "next/link";

export default function NavigationBar() {
  function handleHomeClick(event) {
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/") {
        window.dispatchEvent(new CustomEvent("booking-reset-view"));
      }
    }
  }

  return (
    <header className="bg-primary text-white">
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <h1 className="h3 mb-0 fw-bold">
              <Link className="text-decoration-none text-white" href="/" onClick={handleHomeClick}>
                Booking System
              </Link>
            </h1>
          </div>
          <nav className="d-flex align-items-center gap-3 fw-semibold">
            <Link className="text-decoration-none text-white" href="/" onClick={handleHomeClick}>
              Home
            </Link>
            <Link className="text-decoration-none text-white" href="/reservations">
              Reservations
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

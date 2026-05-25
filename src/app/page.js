"use client";

import { useEffect, useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";
import DealsAndDiscountsCarousel from "./components/DealsAndDiscountsCarousel";
import HotelDetail from "./components/HotelDetail";
import Payment from "./components/Payment";
import PopularSearches from "./components/PopularSearches";
import SearchBar from "./components/SearchBar";
import SearchResultCarousel from "./components/SearchResultCarousel";
import SearchResults from "./components/SearchResults";
import { getDeals, getPopularSearches, searchHotels } from "@/services/backendClient";

const emptySearchData = {
  searchText: "",
  checkInDate: "",
  checkOutDate: "",
  guestCount: "",
  roomCount: ""
};

export default function HomePage() {
  const [deals, setDeals] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [searchData, setSearchData] = useState(emptySearchData);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [paymentReservation, setPaymentReservation] = useState(null);
  const [view, setView] = useState("initial");
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoadingInitialData(true);
        setError("");
        const [dealsData, popularSearchesData] = await Promise.all([getDeals(), getPopularSearches()]);
        setDeals(dealsData);
        setPopularSearches(popularSearchesData);
      } catch (requestError) {
        setError("Home data could not be loaded.");
      } finally {
        setLoadingInitialData(false);
      }
    }

    loadHomeData();
  }, []);

  // Handle reset view when Home link/logo is clicked in navigation bar
  useEffect(() => {
    function handleResetView() {
      setSearchResults([]);
      setSelectedHotelId("");
      setPaymentReservation(null);
      setView("initial");
    }

    window.addEventListener("booking-reset-view", handleResetView);
    return () => window.removeEventListener("booking-reset-view", handleResetView);
  }, []);

  async function handleSearch(nextSearchData) {
    try {
      setSearching(true);
      setError("");
      const hotels = await searchHotels(nextSearchData.searchText);
      setSearchData(nextSearchData);
      setSearchResults(hotels);
      setSelectedHotelId("");
      setPaymentReservation(null);
      setView("carousel");
    } catch (requestError) {
      setError("Search failed. Please make sure json-server is running.");
    } finally {
      setSearching(false);
    }
  }

  async function handlePopularSearch(item) {
    await handleSearch({
      searchText: item.searchText,
      checkInDate: "",
      checkOutDate: "",
      guestCount: "",
      roomCount: ""
    });
    setView("list");
  }

  function selectHotel(hotelId) {
    setSelectedHotelId(hotelId);
    setPaymentReservation(null);
    setView("detail");
  }

  function startPayment(reservation) {
    setPaymentReservation(reservation);
    setView("payment");
  }

  function completePayment() {
    setSearchData(emptySearchData);
    setSearchResults([]);
    setSelectedHotelId("");
    setPaymentReservation(null);
    setView("initial");
  }

  function renderMainContent() {
    if (loadingInitialData) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      );
    }

    if (view === "detail") {
      return (
        <HotelDetail
          hotelId={selectedHotelId}
          searchData={searchData}
          onStartPayment={startPayment}
        />
      );
    }

    if (view === "payment" && paymentReservation) {
      return (
        <Payment
          reservationData={paymentReservation}
          onCompleted={completePayment}
        />
      );
    }

    if (view === "list") {
      return (
        <>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
            <div>
              <h2 className="h4 mb-1">Search Results</h2>
            </div>
            <span className="badge text-bg-light border text-dark">{searchResults.length} hotels</span>
          </div>
          <SearchResults hotels={searchResults} onSelectHotel={selectHotel} />
        </>
      );
    }

    if (view === "carousel") {
      return (
        <>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
            <div>
              <h2 className="h4 fw-bold mb-1">Results for &quot;{searchData.searchText}&quot;</h2>
              <p className="text-secondary mb-0">{searchResults.length} hotel(s) found</p>
            </div>
            <button className="btn btn-link p-0 fw-semibold ms-md-auto align-self-md-center" type="button" onClick={() => setView("list")}>
              See more deals
            </button>
          </div>
          <SearchResultCarousel
            hotels={searchResults}
            onSelectHotel={selectHotel}
          />
          <div className="popular-section-divider" />
          <div className="section-heading">
            <h2>Popular Searches</h2>
          </div>
          <PopularSearches popularSearches={popularSearches} onSelect={handlePopularSearch} />
        </>
      );
    }

    return (
        <>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
          <div>
            <h2 className="h4 fw-bold mb-1">Deals and Discounts</h2>
          </div>
        </div>
        <DealsAndDiscountsCarousel deals={deals} />
        <div className="popular-section-divider" />
        <div className="mb-4">
          <h2 className="h4 fw-bold mb-1">Popular Searches</h2>
        </div>
        <PopularSearches popularSearches={popularSearches} onSelect={handlePopularSearch} />
      </>
    );
  }

  return (
    <main>
      {view !== "detail" && view !== "payment" && (
        <section className="hero-section py-5">
          <Container>
            <SearchBar key={JSON.stringify(searchData)} onSearch={handleSearch} initialValues={searchData} />
          </Container>
        </section>
      )}

      <section className={view === "detail" || view === "payment" ? "py-5" : "pb-5"}>
        <Container>
          <div className="row justify-content-center">
            <div className={view === "detail" || view === "payment" ? "col-12" : "col-lg-11 col-xl-10"}>
              <div className={view === "detail" || view === "payment" ? "" : "bg-white border shadow-sm p-4 p-lg-4"}>
                {error && <Alert variant="danger">{error}</Alert>}
                {searching ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  renderMainContent()
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

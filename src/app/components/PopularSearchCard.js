"use client";

import ImageWithFallback from "./ImageWithFallback";

export default function PopularSearchCard({ item, onSelect }) {
  return (
    <button
      className="card popular-card clickable-card text-start w-100 h-100 border rounded-4 shadow-sm overflow-hidden popular-search-button p-0"
      type="button"
      onClick={() => onSelect(item)}
    >
      <ImageWithFallback src={item.imageUrl} alt={item.title} className="card-img-top" />
      <div className="card-body d-flex flex-column">
        <h3 className="card-title h6 fw-bold mb-2">{item.title}</h3>
        <p className="small text-secondary mb-0 flex-grow-1">{item.details}</p>
      </div>
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";

function addGoogleMapsKey(src, alt) {
  if (!src) return "/images/city.png";

  if (src.includes("googleapis.com")) {
    // Extract hotel name and photo index from alt text. Alt can be:
    // - "Hotel Name - Room Type photo X"
    // - "Hotel Name photo X"
    // - "Hotel Name"
    let hotelName = alt || "";
    let photoIndex = 0;
    
    if (hotelName.includes(" - ")) {
      const parts = hotelName.split(" - ");
      hotelName = parts[0];
      const roomPart = parts[1] || "";
      const roomPhotoMatch = roomPart.match(/photo\s+(\d+)/i);
      if (roomPhotoMatch) {
        photoIndex = parseInt(roomPhotoMatch[1], 10) - 1;
      }
    }
    
    const photoMatch = hotelName.match(/(.*)\s+photo\s+(\d+)/i);
    if (photoMatch) {
      hotelName = photoMatch[1];
      photoIndex = parseInt(photoMatch[2], 10) - 1;
    }
    
    if (hotelName) {
      return `/api/hotel-image?name=${encodeURIComponent(hotelName.trim())}&index=${photoIndex}`;
    }
  }

  return src;
}

export default function ImageWithFallback({ src, alt, className, ...imageProps }) {
  const [imageSrc, setImageSrc] = useState(addGoogleMapsKey(src, alt));

  useEffect(() => {
    setImageSrc(addGoogleMapsKey(src, alt));
  }, [src, alt]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        // Fallback if loading fails in the browser
        setImageSrc("/images/city.png");
      }}
      {...imageProps}
    />
  );
}


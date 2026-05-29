import React from "react";
import { angadi_logo } from "../../assets";

/**
 * Storefront / marketing banner using the Mankatha Spices brand artwork.
 * @param {"hero" | "strip"} variant
 */
const MankathaBanner = ({ variant = "hero", className = "" }) => {
  const isStrip = variant === "strip";
  return (
    <div
      className={`mankatha-banner overflow-hidden rounded-2xl border border-primary-200/80 bg-white shadow-sm flex justify-center items-center p-2 ${className}`}
    >
      <img
        src={angadi_logo}
        alt="Mankatha Spices — Pure spices, rich flavour, trusted quality"
        className={
          isStrip
            ? "w-full h-auto max-h-32 object-contain"
            : "w-full h-auto max-h-[min(420px,55vh)] object-contain"
        }
        loading="lazy"
      />
    </div>
  );
};

export default MankathaBanner;

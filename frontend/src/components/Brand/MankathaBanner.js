import React from "react";
import { MANKATHA_BRAND_IMAGE } from "./brandAsset";

/**
 * Storefront / marketing banner using the Mankatha Spices brand artwork.
 * @param {"hero" | "strip"} variant
 */
const MankathaBanner = ({ variant = "hero", className = "" }) => {
  const isStrip = variant === "strip";
  return (
    <div
      className={`mankatha-banner overflow-hidden rounded-2xl border border-primary-200/80 bg-primary-50 shadow-sm ${className}`}
    >
      <img
        src={MANKATHA_BRAND_IMAGE}
        alt="Mankatha Spices — Pure spices, rich flavour, trusted quality"
        className={
          isStrip
            ? "w-full max-h-40 object-cover object-center sm:max-h-48"
            : "w-full max-h-[min(420px,55vh)] object-contain object-center sm:max-h-[480px]"
        }
        loading="lazy"
      />
    </div>
  );
};

export default MankathaBanner;

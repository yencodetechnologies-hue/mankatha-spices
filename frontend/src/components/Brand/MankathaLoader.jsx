import React from "react";
import { angadi_logo } from "../../assets";

/**
 * Branded loading state (initial auth, protected routes, long actions).
 */
const MankathaLoader = ({ message = "Loading…", fullScreen = false }) => {
  const shell = fullScreen
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary-50/95 backdrop-blur-sm"
    : "flex flex-col items-center justify-center py-16 px-4";

  return (
    <div className={shell} role="status" aria-live="polite" aria-busy="true">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary-300/35" aria-hidden />
        <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-primary-400/50 bg-white shadow-md sm:h-32 sm:w-32">
          <img
            src={angadi_logo}
            alt=""
            className="h-full w-full object-contain p-2"
          />
        </div>
      </div>
      <p className="mt-6 text-sm font-medium tracking-wide text-secondary-800">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default MankathaLoader;

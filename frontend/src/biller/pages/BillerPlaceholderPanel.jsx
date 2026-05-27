import React from "react";
const BillerPlaceholderPanel = ({ title }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
    <p className="text-4xl">🧾</p>
    <h2 className="text-xl font-semibold text-[#3d2f26]">{title}</h2>
    <p className="text-sm text-gray-500 max-w-sm">This section is under construction. Coming soon!</p>
  </div>
);
export default BillerPlaceholderPanel;

// --- ZoomControls.jsx ---

import React from "react";

export default function ZoomControls({ zoomIn, zoomOut, resetZoom, isElevationView }) {
  return (
    <div className="flex flex-col gap-2"> 
      <button
        aria-label="Zoom in"
        onClick={zoomIn}
        className="rounded-full bg-gray-700 hover:bg-gray-600 text-white p-3 shadow-lg transition-colors duration-200"
      >
        ➕
      </button>
      <button
        aria-label="Zoom out"
        onClick={zoomOut}
        className="rounded-full bg-gray-700 hover:bg-gray-600 text-white p-3 shadow-lg transition-colors duration-200 z-10"
      >
        ➖
      </button>
      {/* Reset button only appears in Elevation View */}
      {isElevationView && (
          <button
            aria-label="Reset Zoom"
            onClick={resetZoom}
            className="rounded-full bg-gray-700 hover:bg-green-600 text-white p-3 shadow-lg mt-2 transition-colors duration-200 z-10"
          >
            ⟲
          </button>
      )}
    </div>
  );
}
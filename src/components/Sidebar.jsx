import React, { useState } from "react";

export default function Sidebar({
  selectedBody,
  selectBody,
  selectedView,
  onSelectViewSatellite,
  onSelectViewElevation,
  isEarth,
  currentDate,
  setQuickDate,
  dates,
  onToggleAI,
  flyToCoordinates // function to move the map
}) {
  const bodies = [
    { key: "earth", label: "Earth" },
    { key: "moon", label: "Moon" },
    { key: "mars", label: "Mars" },
    { key: "mercury", label: "Mercury" }
  ];

  const views = [
    { key: "satellite", label: "Satellite View" },
    { key: "elevation", label: "Topography" }
  ];

  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");

  const handleFlyTo = () => {
    if (!isEarth || selectedView !== "satellite") return;

    const lat = parseFloat(latInput.trim());
    const lng = parseFloat(lngInput.trim());

    if (isNaN(lat) || isNaN(lng)) {
      alert("⚠️ Coordinates must be numbers. Use dot (.) for decimals.");
      return;
    }

    if (lat < -60 || lat > 85) {
      alert("⚠️ Latitude must be between -60° and 85°.");
      return;
    }

    if (lng < -180 || lng > 180) {
      alert("⚠️ Longitude must be between -180° and 180°.");
      return;
    }

    flyToCoordinates(lat, lng);
    setLatInput("");
    setLngInput("");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 p-4 space-y-6 header-font bg-gray-800 text-white">
      {/* Celestial Bodies */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Celestial Bodies</h2>
        <div className="flex flex-col gap-2">
          {bodies.map((b) => (
            <button
              key={b.key}
              onClick={() => selectBody(b.key)}
              className={`flex justify-center items-center p-2 rounded text-center font-medium transform transition duration-200 ease-in-out ${
                selectedBody === b.key
                  ? "bg-[#573482] text-white scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-[#8663B0] hover:scale-105"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode */}
      <div>
        <h2 className="text-lg font-semibold mb-2">View Mode</h2>
        <div className="flex flex-col gap-2">
          {views.map((v) => (
            <button
              key={v.key}
              onClick={() =>
                v.key === "satellite"
                  ? onSelectViewSatellite()
                  : onSelectViewElevation()
              }
              className={`flex justify-center items-center p-2 rounded text-center font-medium transform transition duration-200 ease-in-out ${
                selectedView === v.key
                  ? "bg-[#573482] text-white scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-[#8663B0] hover:scale-105"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Earth Satellite Section */}
      {isEarth && selectedView === "satellite" && (
        <div className="p-3 rounded-lg bg-[#573482] space-y-4">
          {/* Date Selector */}
          <div>
            <label
              htmlFor="quickDate"
              className="block text-sm font-semibold text-white"
            >
              Select Date (Earth)
            </label>
            <select
              id="quickDate"
              value={currentDate}
              onChange={(e) => setQuickDate(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white border border-[#573482] rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">-- Choose Date --</option>
              {dates.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinates Input */}
          <div>
            <label className="block text-sm font-semibold text-white">
              Go to Coordinates
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Lat (41.15)"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className="w-1/2 p-2 bg-gray-700 text-white border border-[#573482] rounded-md"
              />
              <input
                type="text"
                placeholder="Lng (20.16)"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                className="w-1/2 p-2 bg-gray-700 text-white border border-[#573482] rounded-md"
              />
            </div>
            <button
              onClick={handleFlyTo}
              className="w-full p-2 bg-[#8663B0] hover:bg-white hover:text-[#8663B0] rounded-md text-white font-semibold mt-2"
            >
              Go to Location
            </button>
          </div>
        </div>
      )}

      {/* AI Chatbot Button */}
      <div className="mt-auto">
        <h2 className="text-lg font-semibold mb-2">Assistant</h2>
        <button
          onClick={onToggleAI}
          className="flex justify-center items-center w-full p-2 rounded bg-[#573482] text-white font-semibold hover:bg-[#8663B0] transform hover:scale-105 transition duration-200"
        >
          Open AI Chatbot
        </button>
      </div>
    </aside>
  );
}

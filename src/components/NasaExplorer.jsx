import React, { useRef, useEffect, useState, useCallback, Suspense } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import MobileControls from "./MobileControls";
import ZoomControls from "./ZoomControls";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Lazy load Chatbot
import NasaChatbot from "./AI";

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const INITIAL_DATE = "2024-08-15";

const BODIES = {
  earth: {
    name: "Earth",
    icon: "🌍",
    satellite: {
      url: (date) =>
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
      label: "VIIRS/SNPP True Color",
    },
    elevation: {
      image: "https://media.sciencephoto.com/image/e0500675/800wm",
      label: "Global Elevation Map",
      info: "SRTM/ASTER Data",
    },
    hasDates: true,
    dates: [
      { value: "2024-09-01", label: "2024-09-01 (September)" },
      { value: "2024-08-15", label: "2024-08-15 (August)" },
      { value: "2024-07-01", label: "2024-07-01 (July)" },
    ],
  },
  moon: {
    name: "Moon",
    icon: "🌙",
    satellite: {
      url: "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0//default/default028mm/{z}/{y}/{x}.jpg",
      label: "LRO WAC Global Mosaic",
    },
    elevation: {
      image: "https://pubs.usgs.gov/of/2006/1367/images/coverphoto.jpg",
      label: "Moon Topography",
      info: "3D Elevation Model",
    },
    hasDates: false,
  },
  mars: {
    name: "Mars",
    icon: "🔴",
    satellite: {
      url: "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0//default/default028mm/{z}/{y}/{x}.jpg",
      label: "Viking MDIM Mosaic",
    },
    elevation: {
      image: "https://cdn.mos.cms.futurecdn.net/XdrsSzvjJB9bc5wTyFW3KV-1200-80.jpg.webp",
      label: "Mars Topography",
      info: "MOLA Elevation Data",
    },
    hasDates: false,
  },
  mercury: {
    name: "Mercury",
    icon: "☿",
    satellite: {
      url: "https://trek.nasa.gov/tiles/Mercury/EQ/Mercury_MESSENGER_MDIS_Basemap_LOI_Mosaic_Global_166m/1.0.0//default/default028mm/{z}/{y}/{x}.jpg",
      label: "MESSENGER MDIS Mosaic",
    },
    elevation: {
      image: "https://pressbooks.online.ucf.edu/app/uploads/sites/40/2018/12/OSC_Astro_09_05_MercuryTopo-1.jpg",
      label: "MLA Elevation Data",
      info: "MESSENGER Laser Altimeter",
    },
    hasDates: false,
  },
};

export default function NasaExplorer() {
  const viewerRef = useRef(null);
  const leafletMap = useRef(null);
  const currentLayerRef = useRef(null);
  const [currentBody, setCurrentBody] = useState("earth");
  const [currentView, setCurrentView] = useState("satellite");
  const [currentDate, setCurrentDate] = useState(INITIAL_DATE);
  const [mapZoomInfo, setMapZoomInfo] = useState("Zoom: -/-");
  const [elevationZoom, setElevationZoom] = useState(1);
  const [showAI, setShowAI] = useState(false);
  const [locationMarker, setLocationMarker] = useState(null);

  const currentBodyData = BODIES[currentBody];
  const isSatelliteView = currentView === "satellite";
  const isEarth = currentBody === "earth";

  // --- Satellite layer ---
  const createSatelliteLayer = useCallback((body, date) => {
    const config = BODIES[body];
    const url = body === "earth" ? config.satellite.url(date) : config.satellite.url;
    return L.tileLayer(url, {
      attribution: "NASA",
      tileSize: 256,
      bounds: [
        [-85.0511, -180],
        [85.0511, 180],
      ],
    });
  }, []);

  const loadSatelliteLayer = useCallback(
    (body, date) => {
      const map = leafletMap.current;
      if (!map) return;
      if (currentLayerRef.current) map.removeLayer(currentLayerRef.current);
      const newLayer = createSatelliteLayer(body, date);
      newLayer.addTo(map);
      currentLayerRef.current = newLayer;
      map.setView([20, 0], 2);
      setMapZoomInfo("Zoom: 2/9");
    },
    [createSatelliteLayer]
  );

  useEffect(() => {
    if (leafletMap.current) return;

    leafletMap.current = L.map(viewerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 9,
      worldCopyJump: true,
      zoomControl: false,
    });

    leafletMap.current.on("zoomend", () => {
      if (currentView === "satellite") {
        const zoom = leafletMap.current.getZoom();
        setMapZoomInfo(`Zoom: ${zoom}/9`);
      }
    });

    loadSatelliteLayer(currentBody, currentDate);
  }, [currentView, currentBody, currentDate, loadSatelliteLayer]);

  // --- Fly to coordinates ---
  const flyToCoordinates = (lat, lng) => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    // Fly to location
    map.flyTo([lat, lng], 7, { animate: true, duration: 1.5 });

    // Remove old marker
    if (locationMarker) {
      locationMarker.remove();
    }

    // Add new marker
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: "custom-marker",
        html: `<div style="background:#FF4444;width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba(0,0,0,0.5);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
    }).addTo(map);

    setLocationMarker(marker);
  };

  // --- Controls ---
  const selectBody = (body) => {
    setCurrentBody(body);
    if (currentView === "satellite") loadSatelliteLayer(body, currentDate);
    else setElevationZoom(1);
  };

  const switchToSatellite = () => {
    setCurrentView("satellite");
    loadSatelliteLayer(currentBody, currentDate);
  };

  const switchToElevation = () => {
    setCurrentView("elevation");
    setElevationZoom(1);
  };

  const setQuickDate = (date) => {
    setCurrentDate(date);
    if (currentBody === "earth" && currentView === "satellite")
      loadSatelliteLayer("earth", date);
  };

  const zoomIn = () => {
    if (isSatelliteView) leafletMap.current.zoomIn();
    else setElevationZoom((z) => Math.min(z * 1.3, 5));
  };

  const zoomOut = () => {
    if (isSatelliteView) leafletMap.current.zoomOut();
    else setElevationZoom((z) => Math.max(z / 1.3, 0.5));
  };

  const resetZoom = () => {
    if (isSatelliteView) leafletMap.current.setView([20, 0], 2);
    else setElevationZoom(1);
  };

  const elevationImageStyle = {
    transform: `scale(${elevationZoom})`,
    transition: "transform 0.2s ease-out",
  };

  const zoomText = isSatelliteView
    ? mapZoomInfo
    : `Zoom: ${elevationZoom.toFixed(1)}x`;
  const dateInfoText = isSatelliteView
    ? isEarth && currentDate
      ? currentDate
      : "Archive Data"
    : currentBodyData.elevation.info;

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
      <Header />
      <div className="flex flex-1">
        <Sidebar
          selectedBody={currentBody}
          selectBody={selectBody}
          selectedView={currentView}
          onSelectViewSatellite={switchToSatellite}
          onSelectViewElevation={switchToElevation}
          isEarth={isEarth}
          currentDate={currentDate}
          setQuickDate={setQuickDate}
          dates={BODIES.earth.dates}
          onToggleAI={() => setShowAI(true)}
          flyToCoordinates={flyToCoordinates} // ✅ pass function
        />

        <main className="flex-1 relative bg-black">
          {/* Map */}
          <div
            ref={viewerRef}
            className="absolute inset-0 z-0"
            style={{ display: isSatelliteView ? "block" : "none" }}
          />

          {/* Elevation View */}
          {!isSatelliteView && (
            <div className="absolute inset-0 flex justify-center items-center bg-black overflow-hidden">
              <img
                src={currentBodyData.elevation.image}
                alt="Elevation"
                style={elevationImageStyle}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 z-5 flex flex-col gap-2">
            <ZoomControls
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              resetZoom={resetZoom}
              isElevationView={!isSatelliteView}
            />
          </div>

          {/* Info */}
          <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 p-3 rounded-lg text-sm">
            <p>
              {currentBodyData.icon} {currentBodyData.name}
            </p>
            <p>🛰️ {currentBodyData.satellite.label}</p>
            <p>📅 {dateInfoText}</p>
            <p>🔎 {zoomText}</p>
          </div>

          {/* AI Chatbot */}
          {showAI && (
            <div className="absolute top-5 right-6 z-10 w-[350px] h-[450px] bg-gray-950 bg-opacity-95 border rounded-xl shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center p-3 border-b">
                <h3 className="font-semibold text-lg">NASA AI Chatbot</h3>
                <button
                  onClick={() => setShowAI(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✖
                </button>
              </div>
              <Suspense
                fallback={
                  <div className="flex justify-center items-center h-full">
                    Loading AI assistant...
                  </div>
                }
              >
                <NasaChatbot onClose={() => setShowAI(false)} />
              </Suspense>
            </div>
          )}
        </main>
      </div>
      <MobileControls />
      <Footer />
    </div>
  );
}

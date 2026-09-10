import { useEffect, useState } from "react";
import VillageMarkers from "./VillageMarkers";
import HazardLayer from "./HazardLayer";
import RelocationSites from "./RelocationSites";
import EvacuationRoute from "./EvacuationRoute";
import MapLegend from "./MapLegend";
import MapFocus from "./MapFocus";

import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "../../utils/smoothWheelZoom";

const INDIA_BOUNDS = [
  [6.5, 68.0],
  [37.5, 97.5],
];

const TILES = {
  CLEAN: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  TOPO: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
};

// India bounds controller
const IndiaBoundsController = () => {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(INDIA_BOUNDS, {
      padding: [20, 20],
      animate: true,
      duration: 0.8,
    });
  }, [map]);

  return null;
};

// Smooth resize invalidator when AI side panel opens/closes
const MapResizeHandler = ({ selectedVillage }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size in steps to track the 350ms CSS width transition smoothly
    const intervals = [50, 150, 250, 360, 480];
    const timers = intervals.map((ms) =>
      setTimeout(() => {
        map.invalidateSize({ animate: false });
      }, ms)
    );

    return () => timers.forEach(clearTimeout);
  }, [selectedVillage, map]);

  return null;
};

const MapView = ({
  villages,
  hazards,
  selectedVillage,
  onSelectVillage,
  focusLocation,
}) => {
  const [tileTheme, setTileTheme] = useState("CLEAN");
  const [showRoutes, setShowRoutes] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showShelters, setShowShelters] = useState(true);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* MAP LAYER CONTROLS (Floating HUD Top Right) */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          zIndex: 1000,
          background: "rgba(15, 23, 42, 0.88)",
          backdropFilter: "blur(8px)",
          padding: "6px 10px",
          borderRadius: "8px",
          display: "flex",
          gap: "6px",
          alignItems: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <button
          onClick={() => setTileTheme(tileTheme === "CLEAN" ? "TOPO" : "CLEAN")}
          style={{
            background: tileTheme === "TOPO" ? "#16a34a" : "#334155",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "5px 9px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {tileTheme === "TOPO" ? "🏔️ Terrain" : "🗺️ Streets"}
        </button>

        <button
          onClick={() => setShowHazards(!showHazards)}
          style={{
            background: showHazards ? "#ea580c" : "#334155",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "5px 9px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {showHazards ? "🌊 Hazards ON" : "Hazards OFF"}
        </button>

        <button
          onClick={() => setShowShelters(!showShelters)}
          style={{
            background: showShelters ? "#16a34a" : "#334155",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "5px 9px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {showShelters ? "🏠 Shelters ON" : "Shelters OFF"}
        </button>
      </div>

      <MapContainer
        center={[22.5, 79]}
        zoom={5}
        minZoom={4}
        maxZoom={18}
        zoomControl={false}
        preferCanvas={true}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={0.85}
        scrollWheelZoom={false}
        smoothWheelZoom={true}
        smoothSensitivity={2.0}
        zoomSnap={0}
        zoomDelta={1.4}
        zoomAnimation={true}
        zoomAnimationThreshold={8}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "0",
        }}
      >
        {/* Buttery Smooth Zoom CSS transitions */}
        <style>{`
          .leaflet-zoom-anim .leaflet-zoom-animated {
            transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
          }
          .leaflet-tile {
            transition: opacity 0.15s ease-out !important;
          }
        `}</style>
        <IndiaBoundsController />
        <MapResizeHandler selectedVillage={selectedVillage} />

        {/* Zoom controls at bottom-right so top-left search bar has zero overlap */}
        <ZoomControl position="bottomright" />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={TILES[tileTheme] || TILES.CLEAN}
        />

        <MapFocus location={focusLocation} selectedVillage={selectedVillage} />

        {showHazards && <HazardLayer hazards={hazards} />}

        <VillageMarkers
          villages={villages}
          selectedVillage={selectedVillage}
          onSelectVillage={onSelectVillage}
        />

        {showShelters && <RelocationSites />}

        {/* HUNGARIAN OPTIMAL EVACUATION CORRIDOR */}
        {showRoutes && <EvacuationRoute selectedVillage={selectedVillage} />}
      </MapContainer>

      <MapLegend />
    </div>
  );
};

export default MapView;
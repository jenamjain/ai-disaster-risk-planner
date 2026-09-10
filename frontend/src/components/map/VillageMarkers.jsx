import { useEffect, useRef, useCallback } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Risk level color mapping
const riskColors = {
  CRITICAL: "#dc2626",
  HIGH: "#ea580c",
  MEDIUM: "#d97706",
  LOW: "#16a34a",
};

// Hazard-specific styling and emojis
const getHazardMarkerConfig = (hazardType) => {
  const h = String(hazardType || "").toLowerCase();
  if (h.includes("cyclone")) {
    return {
      emoji: "🌀",
      label: "Cyclone",
      bg: "linear-gradient(135deg, #0284c7, #0369a1)",
      border: "#38bdf8",
      shadow: "0 2px 8px rgba(2, 132, 199, 0.45)",
    };
  }
  if (h.includes("surge")) {
    return {
      emoji: "🌊",
      label: "Storm Surge",
      bg: "linear-gradient(135deg, #0d9488, #0f766e)",
      border: "#2dd4bf",
      shadow: "0 2px 8px rgba(13, 148, 136, 0.45)",
    };
  }
  if (h.includes("subsidence") || h.includes("mining")) {
    return {
      emoji: "⛏️",
      label: "Ground Subsidence",
      bg: "linear-gradient(135deg, #475569, #334155)",
      border: "#cbd5e1",
      shadow: "0 2px 8px rgba(71, 85, 105, 0.45)",
    };
  }
  if (h.includes("landslide")) {
    return {
      emoji: "⛰️",
      label: "Landslide",
      bg: "linear-gradient(135deg, #d97706, #b45309)",
      border: "#fde68a",
      shadow: "0 2px 8px rgba(217, 119, 6, 0.45)",
    };
  }
  if (h.includes("flash")) {
    return {
      emoji: "⚡",
      label: "Flash Flood",
      bg: "linear-gradient(135deg, #6366f1, #4f46e5)",
      border: "#c7d2fe",
      shadow: "0 2px 8px rgba(99, 102, 241, 0.45)",
    };
  }
  // Default: Flood
  return {
    emoji: "🌊",
    label: "Flood",
    bg: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    border: "#93c5fd",
    shadow: "0 2px 8px rgba(37, 99, 235, 0.45)",
  };
};

// Risk severity border ring settings
const riskRingStyles = {
  CRITICAL: {
    borderColor: "#ef4444",
    ringWidth: "3px",
    animation: "radar-ping-red 1.8s infinite cubic-bezier(0.25, 1, 0.5, 1)",
    pinSize: 32,
    fontSize: "15px",
  },
  HIGH: {
    borderColor: "#f97316",
    ringWidth: "2.5px",
    animation: "radar-ping-orange 2.2s infinite cubic-bezier(0.25, 1, 0.5, 1)",
    pinSize: 30,
    fontSize: "14px",
  },
  MEDIUM: {
    borderColor: "#eab308",
    ringWidth: "2px",
    animation: "none",
    pinSize: 27,
    fontSize: "13px",
  },
  LOW: {
    borderColor: "#10b981",
    ringWidth: "2px",
    animation: "none",
    pinSize: 25,
    fontSize: "12px",
  },
};

const createIcon = (hazardType, riskLevel, isAnomaly) => {
  const haz = getHazardMarkerConfig(hazardType);
  const risk = riskRingStyles[riskLevel] || riskRingStyles.LOW;
  const isCritical = riskLevel === "CRITICAL";
  const isHigh = riskLevel === "HIGH";

  return L.divIcon({
    className: "custom-hazard-pin",
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
      ">
        ${(isCritical || isHigh) ? `
          <div style="
            position: absolute;
            width: ${risk.pinSize + 8}px;
            height: ${risk.pinSize + 8}px;
            border-radius: 50%;
            animation: ${risk.animation};
            pointer-events: none;
          "></div>
        ` : ""}
        <div style="
          background: ${haz.bg};
          width: ${risk.pinSize}px;
          height: ${risk.pinSize}px;
          border-radius: 50%;
          border: ${risk.ringWidth} solid ${risk.borderColor};
          box-shadow: ${haz.shadow}, 0 2px 6px rgba(0,0,0,0.3);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${risk.fontSize};
          cursor: pointer;
          user-select: none;
        " title="${haz.label} (${riskLevel})">
          ${haz.emoji}
        </div>
        ${isAnomaly ? `
          <div style="
            position: absolute;
            top: 2px;
            right: 2px;
            background: #ef4444;
            color: white;
            font-size: 8px;
            font-weight: 900;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            border: 1.5px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20;
          ">!</div>
        ` : ""}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
};

const VillageMarkers = ({ villages, selectedVillage, onSelectVillage }) => {
  const markerRefs = useRef({});
  const skipPopupRef = useRef({});
  const map = useMap();

  useEffect(() => {
    if (!selectedVillage) return;

    // If user clicked 'View Safe Shelter & Evacuation Route', close popup and keep it closed
    if (skipPopupRef.current[selectedVillage.id] || selectedVillage.closePopup) {
      const marker = markerRefs.current[selectedVillage.id];
      if (marker) {
        marker.closePopup();
      }
      map.closePopup();
      return;
    }

    const marker = markerRefs.current[selectedVillage.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedVillage, map]);

  const handleInspectClick = useCallback((e, village) => {
    e.stopPropagation();
    e.preventDefault();

    // Mark skipPopup so this village's popup stays closed while viewing the route
    skipPopupRef.current[village.id] = true;

    // Immediately close the marker popup and global map popup
    const marker = markerRefs.current[village.id];
    if (marker) {
      marker.closePopup();
    }
    map.closePopup();

    if (onSelectVillage) {
      onSelectVillage({ ...village, closePopup: true });
    }
  }, [onSelectVillage, map]);

  const handleClosePopup = useCallback((e, villageId) => {
    e.stopPropagation();
    e.preventDefault();
    skipPopupRef.current[villageId] = true;
    const marker = markerRefs.current[villageId];
    if (marker) {
      marker.closePopup();
    }
    map.closePopup();
  }, [map]);

  return (
    <>
      {/* Global popup close button styles */}
      <style>{`
        .leaflet-popup-close-button {
          display: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          padding: 0 !important;
          box-shadow: 0 8px 28px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .leaflet-popup-tip {
          box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
        }
      `}</style>

      {villages.map((village) => {
        const hazCfg = getHazardMarkerConfig(village.hazardType);
        return (
          <Marker
            key={village.id}
            position={[village.lat, village.lng]}
            icon={createIcon(village.hazardType, village.riskLevel, village.isAnomaly)}
            eventHandlers={{
              click: () => {
                skipPopupRef.current[village.id] = false;
                if (onSelectVillage) {
                  onSelectVillage(village);
                }
              },
            }}
            ref={(marker) => {
              markerRefs.current[village.id] = marker;
            }}
          >
            <Popup maxWidth={280} minWidth={240} autoPan={true} closeButton={false}>
              <div style={{ minWidth: "230px", maxWidth: "270px", fontFamily: "'Inter', system-ui, sans-serif", padding: "12px 14px 10px 14px", position: "relative" }}>
                
                {/* ═══ PROMINENT CLOSE BUTTON ═══ */}
                <button
                  onClick={(e) => handleClosePopup(e, village.id)}
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: "1.5px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#475569",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: "1",
                    zIndex: 999,
                    transition: "all 0.15s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#ef4444";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = "#ef4444";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.color = "#475569";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                  title="Close popup"
                >
                  ✕
                </button>

                {/* ═══ HEADER: Risk Badge + ID ═══ */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", paddingRight: "28px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: village.riskLevel === "CRITICAL" ? "#fee2e2" : (village.riskLevel === "HIGH" ? "#ffedd5" : (village.riskLevel === "MEDIUM" ? "#fef3c7" : "#dcfce7")),
                      color: riskColors[village.riskLevel] || "#334155",
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                    }}
                  >
                    {village.riskLevel} RISK
                  </span>
                  <span style={{ fontSize: "9.5px", color: "#94a3b8", fontFamily: "monospace", fontWeight: "600" }}>
                    {village.id}
                  </span>
                </div>

                {/* ═══ TITLE: Name + Location ═══ */}
                <div style={{ fontWeight: "700", fontSize: "13.5px", color: "#0f172a", marginBottom: "2px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ fontSize: "16px" }}>{hazCfg.emoji}</span>
                  <span>{village.name}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>
                  📍 {village.district}, {village.state}
                </div>

                {/* ═══ QUICK STATS GRID ═══ */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "4px",
                  fontSize: "10.5px",
                  marginBottom: "8px",
                  background: "#f8fafc",
                  padding: "7px 9px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}>
                  <div>Risk: <strong style={{ color: riskColors[village.riskLevel] }}>{village.riskScore?.toFixed(1) || "—"}</strong></div>
                  <div>Priority: <strong>{village.priority}</strong></div>
                  <div>Pop: <strong>{village.population?.toLocaleString()}</strong></div>
                  <div>Hazard: <strong>{hazCfg.emoji} {hazCfg.label}</strong></div>
                </div>

                {/* ═══ HAZARD DETAIL (if available) ═══ */}
                {village.hazardDetail && (
                  <div style={{
                    fontSize: "10px",
                    color: "#475569",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    padding: "5px 8px",
                    borderRadius: "5px",
                    marginBottom: "8px",
                    lineHeight: "1.35",
                  }}>
                    ⚠️ <strong>Hazard:</strong> {village.hazardDetail}
                  </div>
                )}

                {/* ═══ ACTION BUTTON ═══ */}
                <button
                  onClick={(e) => handleInspectClick(e, village)}
                  style={{
                    width: "100%",
                    padding: "7px",
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>🛡️</span>
                  <span>View Safe Shelter & Evacuation Route →</span>
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default VillageMarkers;
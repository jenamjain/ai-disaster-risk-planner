import { useState } from "react";

const MapLegend = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "24px",
        right: "24px",
        background: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        padding: collapsed ? "8px 12px" : "12px 14px",
        borderRadius: "12px",
        zIndex: 1000,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.45)",
        color: "#f8fafc",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: "11px",
        minWidth: collapsed ? "auto" : "180px",
        transition: "all 0.25s ease",
      }}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "11px",
          letterSpacing: "0.5px",
          color: "#94a3b8",
          textTransform: "uppercase",
          marginBottom: collapsed ? "0" : "8px",
          userSelect: "none",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>🗺️</span> GIS Hazard Markers
        </span>
        <span style={{ fontSize: "10px", marginLeft: "8px" }}>{collapsed ? "▲" : "▼"}</span>
      </div>

      {!collapsed && (
        <>
          {/* Hazard Icons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ fontSize: "14px", width: "20px", textAlign: "center" }}>🌀</span>
              <span style={{ color: "#7dd3fc" }}>Cyclone / Coastal Storm</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ fontSize: "14px", width: "20px", textAlign: "center" }}>🌊</span>
              <span style={{ color: "#93c5fd" }}>Flood & River Overflow</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ fontSize: "14px", width: "20px", textAlign: "center" }}>⛰️</span>
              <span style={{ color: "#fde68a" }}>Landslide Slope Hazard</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ fontSize: "14px", width: "20px", textAlign: "center" }}>⛏️</span>
              <span style={{ color: "#cbd5e1" }}>Ground Subsidence / Mining</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ fontSize: "14px", width: "20px", textAlign: "center" }}>⚡</span>
              <span style={{ color: "#c7d2fe" }}>Flash Flood / Cloudburst</span>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", margin: "8px 0" }} />

          {/* Risk Level Rings */}
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", marginBottom: "5px" }}>
            Border Ring Severity
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px #ef4444" }}></span>
              <span style={{ color: "#fca5a5" }}>Critical</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316" }}></span>
              <span style={{ color: "#fdba74" }}>High Watch</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308" }}></span>
              <span style={{ color: "#fef08a" }}>Medium</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
              <span style={{ color: "#86efac" }}>Low / Stable</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MapLegend;
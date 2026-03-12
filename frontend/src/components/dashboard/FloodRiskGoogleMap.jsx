import { useEffect, useRef, useState, useCallback } from "react";
import Papa from "papaparse";
import { MapPin, Loader2 } from "lucide-react";

// ── Region → LatLng lookup ────────────────────────────────────────────────────
const REGION_COORDS = {
  Kurla:     [19.0726, 72.8826],
  Sion:      [19.0434, 72.8610],
  Ghatkopar: [19.0856, 72.9081],
  Andheri:   [19.1136, 72.8697],
  Bandra:    [19.0596, 72.8295],
  Colaba:    [18.9067, 72.8147],
};

// ── Normalize value within [min, max] → [0, 1] ───────────────────────────────
function normalize(value, min, max) {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// ── Load leaflet + leaflet.heat lazily (avoids SSR issues) ───────────────────
async function loadLeaflet() {
  const L = await import("leaflet");
  await import("leaflet/dist/leaflet.css");
  // leaflet.heat attaches to L automatically
  await import("leaflet.heat");
  return L.default ?? L;
}

const FloodRiskGoogleMap = ({ csvPath = "/flood_risk_data.csv", refreshInterval }) => {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);  // Leaflet map instance
  const heatRef      = useRef(null);  // Heat layer instance
  const markersRef   = useRef([]);    // Marker instances

  const [status, setStatus]   = useState("loading");
  const [stats, setStats]     = useState(null);
  const [pulse, setPulse]     = useState(false);

  // ── Parse CSV & compute heatmap points ─────────────────────────────────────
  const buildPoints = useCallback(() => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvPath, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: ({ data: rows }) => {
          const rainfalls = rows.map(r => r.Daily_Rainfall).filter(Boolean);
          const tides     = rows.map(r => r.Tide_Level).filter(Boolean);
          const minRain = Math.min(...rainfalls), maxRain = Math.max(...rainfalls);
          const minTide = Math.min(...tides),     maxTide = Math.max(...tides);

          // aggregate per region
          const agg = {};
          for (const row of rows) {
            const region = row.Region?.trim();
            if (!REGION_COORDS[region]) continue;
            if (!agg[region]) agg[region] = { weights: [], riskSum: 0, count: 0 };
            const w =
              (row.True_Risk_Probability || 0) * 0.6 +
              normalize(row.Daily_Rainfall || 0, minRain, maxRain) * 0.25 +
              normalize(row.Tide_Level    || 0, minTide, maxTide)  * 0.15;
            agg[region].weights.push(w);
            agg[region].riskSum += row.True_Risk_Probability || 0;
            agg[region].count++;
          }

          const points = Object.entries(agg).map(([region, d]) => {
            const avgW = d.weights.reduce((a, b) => a + b, 0) / d.weights.length;
            const avgR = d.riskSum / d.count;
            const [lat, lng] = REGION_COORDS[region];
            return { lat, lng, weight: avgW, region, avgRisk: avgR, count: d.count };
          });

          resolve(points);
        },
        error: (err) => reject(new Error(err.message)),
      });
    });
  }, [csvPath]);

  // ── Init / refresh ──────────────────────────────────────────────────────────
  const initMap = useCallback(async () => {
    try {
      const L = await loadLeaflet();

      // Create map only once
      if (!mapRef.current && containerRef.current) {
        mapRef.current = L.map(containerRef.current, {
          center: [19.0760, 72.8777],
          zoom: 11,
          zoomControl: true,
          attributionControl: true,
        });

        // Dark tile layer — CartoDB Dark Matter (free, no key)
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
          }
        ).addTo(mapRef.current);
      }

      // Parse CSV
      const points = await buildPoints();

      // Remove old heat layer and markers
      if (heatRef.current) heatRef.current.remove();
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Build leaflet.heat data: [lat, lng, intensity]
      // Expand each region into multiple spread points for smooth visual
      const heatData = [];
      for (const { lat, lng, weight } of points) {
        // Central point
        heatData.push([lat, lng, weight]);
        // Spread cloud: 12 jitter points per region
        for (let i = 0; i < 12; i++) {
          const jLat = lat + (Math.random() - 0.5) * 0.018;
          const jLng = lng + (Math.random() - 0.5) * 0.018;
          const jW   = weight * (0.5 + Math.random() * 0.5);
          heatData.push([jLat, jLng, jW]);
        }
      }

      heatRef.current = L.heatLayer(heatData, {
        radius:    35,
        blur:      25,
        maxZoom:   13,
        max:       1.0,
        gradient: {
          0.0: "#0000ff",
          0.2: "#0050dc",
          0.4: "#00c8a0",
          0.55: "#50dc28",
          0.65: "#c8dc00",
          0.78: "#ffa000",
          0.88: "#ff5000",
          1.0:  "#ff0000",
        },
      }).addTo(mapRef.current);

      // Add region circle markers with popups
      for (const { lat, lng, region, weight, avgRisk, count } of points) {
        const color  = weight > 0.65 ? "#ef4444" : weight > 0.40 ? "#f97316" : "#3b82f6";
        const glow   = weight > 0.65 ? "rgba(239,68,68,0.5)" : weight > 0.40 ? "rgba(249,115,22,0.5)" : "rgba(59,130,246,0.5)";
        const level  = weight > 0.65 ? "🔴 High" : weight > 0.40 ? "🟠 Moderate" : "🔵 Low";

        const marker = L.circleMarker([lat, lng], {
          radius:      8,
          color:       "#ffffff",
          weight:      1.5,
          opacity:     1,
          fillColor:   color,
          fillOpacity: 0.95,
        }).addTo(mapRef.current);

        marker.bindPopup(`
          <div style="background:#161b22;color:#e6edf3;padding:10px 14px;border-radius:8px;
                      font-family:Inter,sans-serif;min-width:170px;border:1px solid #30363d;">
            <div style="font-size:14px;font-weight:600;margin-bottom:6px;">${region}</div>
            <div style="font-size:12px;color:#8b949e;">Risk Level: ${level}</div>
            <div style="font-size:12px;color:#8b949e;">Composite Score: ${(weight * 100).toFixed(1)}%</div>
            <div style="font-size:12px;color:#8b949e;">Avg Risk Prob: ${(avgRisk * 100).toFixed(1)}%</div>
            <div style="font-size:12px;color:#8b949e;">Data Points: ${count}</div>
          </div>
        `, { className: "flood-popup" });

        // Pulse ring animation via CSS keyframes on SVG path
        marker.on("mouseover", function () { this.openPopup(); });
        markersRef.current.push(marker);
      }

      // Fix Leaflet CSS icon path issues (common in Vite)
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      setStats({ count: points.length });
      setStatus("ready");
      setPulse(true);
      setTimeout(() => setPulse(false), 1800);

    } catch (err) {
      console.error("[FloodRiskMap]", err);
      setStatus("error");
    }
  }, [buildPoints]);

  useEffect(() => {
    initMap();
    let iv;
    if (refreshInterval) iv = setInterval(initMap, refreshInterval);
    return () => {
      if (iv) clearInterval(iv);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [initMap, refreshInterval]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Risk Heatmap — Mumbai</h3>
        </div>
        {status === "ready" && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500" style={{ boxShadow: "0 0 6px #22c55e" }} />
            <span>Live · {stats?.count} zones</span>
          </div>
        )}
        {status === "loading" && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Loading…</span>
          </div>
        )}
      </div>

      {/* Map */}
      <div
        style={{
          height: 340,
          borderRadius: 10,
          overflow: "hidden",
          border: `1px solid ${pulse ? "rgba(99,102,241,0.7)" : "rgba(255,255,255,0.06)"}`,
          boxShadow: pulse ? "0 0 22px rgba(99,102,241,0.35)" : "0 0 0 transparent",
          transition: "border-color 1s ease, box-shadow 1s ease",
          position: "relative",
          background: "#0d1117",
        }}
      >
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {/* Loading overlay */}
        {status === "loading" && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
            background: "rgba(13,17,23,0.9)", backdropFilter: "blur(4px)", zIndex: 9999,
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: "50%",
              border: "3px solid rgba(99,102,241,0.15)",
              borderTop: "3px solid #6366f1",
              animation: "_frmSpin 1s linear infinite",
            }} />
            <p style={{ color: "#6e7681", fontSize: 13 }}>Loading flood risk map…</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex gap-5">
          {[
            { label: "Low Risk",  color: "#3b82f6", glow: "rgba(59,130,246,0.5)"  },
            { label: "Moderate",  color: "#f97316", glow: "rgba(249,115,22,0.5)"  },
            { label: "High Risk", color: "#ef4444", glow: "rgba(239,68,68,0.5)"   },
          ].map(({ label, color, glow }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: color, boxShadow: `0 0 7px ${glow}`, flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{label}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.55 }}>
          Hover a pin for details
        </span>
      </div>

      {/* Global styles */}
      <style>{`
        @keyframes _frmSpin { to { transform: rotate(360deg); } }
        .flood-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .flood-popup .leaflet-popup-content { margin: 0 !important; }
        .flood-popup .leaflet-popup-tip-container { display: none; }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution { font-size: 9px; opacity: 0.4; }
      `}</style>
    </div>
  );
};

export default FloodRiskGoogleMap;

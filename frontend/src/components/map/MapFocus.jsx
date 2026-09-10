

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { relocationSites } from "../../utils/relocationSites";
import { calculateDistance } from "../../utils/mapHelpers";

export const getMatchingShelter = (village) => {
  if (!village || !village.lat || !village.lng) return null;
  const candidates = relocationSites
    .filter(
      (s) =>
        s.status === "AVAILABLE" &&
        s.availableCapacity >= (village.population || 0)
    )
    .map((s) => ({
      ...s,
      dist: calculateDistance(village.lat, village.lng, s.lat, s.lng),
    }))
    .sort((a, b) => a.dist - b.dist);
  return candidates.length > 0 ? candidates[0] : relocationSites[0];
};

const MapFocus = ({ location, selectedVillage }) => {
  const map = useMap();

  useEffect(() => {
    const target = selectedVillage || location?.village;

    // Case 1: Village selected -> Fit bounds to show BOTH danger zone and assigned safe shelter
    if (target && target.lat && target.lng) {
      const shelter = getMatchingShelter(target);

      const timer = setTimeout(() => {
        map.invalidateSize({ animate: false });

        if (shelter && shelter.lat && shelter.lng) {
          const bounds = L.latLngBounds([
            [target.lat, target.lng],
            [shelter.lat, shelter.lng],
          ]);

          map.fitBounds(bounds, {
            paddingTopLeft: [75, 75],
            paddingBottomRight: [75, 85],
            maxZoom: 13,
            animate: true,
            duration: 1.2,
          });
        } else {
          map.flyTo([target.lat, target.lng], 13, {
            duration: 1.2,
            easeLinearity: 0.25,
          });
        }
      }, 400);

      return () => clearTimeout(timer);
    }

    // Case 2: Standalone coordinates without a village
    if (location && location.lat && location.lng) {
      const timer = setTimeout(() => {
        map.invalidateSize({ animate: false });
        map.flyTo([location.lat, location.lng], 13, {
          duration: 1.2,
          easeLinearity: 0.25,
        });
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [location, selectedVillage, map]);

  return null;
};

export default MapFocus;
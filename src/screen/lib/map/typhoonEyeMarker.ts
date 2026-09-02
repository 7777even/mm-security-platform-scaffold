import L from 'leaflet';
import type { TyphoonTrackPointInfo } from '../composables/useTyphoonTrackMap';

export const TYPHOON_EYE_ICON_URL = '/images/台风.png';

export function createTyphoonEyeMarker(point: TyphoonTrackPointInfo, popupHtml?: string): L.Marker {
  const icon = L.divIcon({
    className: 'scm-typhoon-eye-marker leaflet-div-icon',
    html: `<img class="scm-typhoon-eye__img" src="${TYPHOON_EYE_ICON_URL}" alt="台风" draggable="false" />`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  const marker = L.marker([point.lat, point.lng], {
    icon,
    zIndexOffset: 1200,
    interactive: Boolean(popupHtml),
    bubblingMouseEvents: false,
  });
  if (popupHtml) {
    marker.bindPopup(popupHtml, {
      className: 'scm-typhoon-popup-wrap',
      maxWidth: 260,
    });
    marker.on('click', () => {
      marker.openPopup();
    });
  }
  return marker;
}

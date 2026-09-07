import { ref } from 'vue';
import { getSharedMap } from './sharedCesiumBridge';
import { openSecuritySearchDetail } from './useSecuritySearchDetail';
import { openSearchPanelForMode } from './useSecuritySearchPanel';
import { resolveSecurityTrackWaypoints, type SecurityTrackMode } from '@/services/security';

export const securityTrackActive = ref(false);
export const securityTrackMode = ref<SecurityTrackMode>('vehicle');
export const securityTrackEntityId = ref<number | null>(null);
export const securityTrackPlaying = ref(true);
export const securityTrackSpeed = ref(1);
export const securityTrackProgress = ref(0);

/** 退出轨迹后恢复的详情上下文 */
const trackReturnContext = ref<{ mode: SecurityTrackMode; entityId: number } | null>(null);

export const securityTrackPlayback = {
  playing: securityTrackPlaying,
  speed: securityTrackSpeed,
  progress: securityTrackProgress,
};

export function openSecurityTrack(mode: SecurityTrackMode, entityId: number) {
  trackReturnContext.value = { mode, entityId };
  openSearchPanelForMode(mode);

  securityTrackMode.value = mode;
  securityTrackEntityId.value = entityId;
  securityTrackActive.value = true;
  securityTrackPlaying.value = true;
  securityTrackSpeed.value = 1;
  securityTrackProgress.value = 0;

  getSharedMap()?.ensureUserInputsEnabled?.();
  requestAnimationFrame(() => {
    const waypoints = resolveSecurityTrackWaypoints(mode);
    void getSharedMap()?.flyToWorldPositions?.({
      positions: waypoints.points,
      duration: 1.05,
      pitchDeg: -48,
      rangeMultiplier: 2.4,
    });
  });
}

export function closeSecurityTrack() {
  const context = trackReturnContext.value;

  securityTrackActive.value = false;
  securityTrackEntityId.value = null;
  securityTrackPlaying.value = false;
  securityTrackProgress.value = 0;
  trackReturnContext.value = null;

  if (context) {
    openSearchPanelForMode(context.mode);
    openSecuritySearchDetail(context.mode, context.entityId);
  }
}

import { ref, watch, onUnmounted, type Ref } from 'vue';
import { fetchVideoSnapshotUrl } from '@/services/video';

export interface CameraSnapshotState {
  url: string | undefined;
  loading: boolean;
  error: boolean;
}

/**
 * 按摄像头 id 列表预取后端静态截图（blob → objectURL），供视频网格 <img> 渲染。
 *
 * 鉴权 seam：图由带 token 的 http 客户端拉取再经 objectURL 喂给 <img>，
 * 规避原生 <img src> 无法携带 Authorization 头导致 401 裂图的问题。
 *
 * 行为：已就绪 / 加载中 / 已失败均不重复触发；组件卸载时回收 objectURL。
 */
export function useCameraSnapshots(ids: Ref<number[]>) {
  const map = ref<Record<number, CameraSnapshotState>>({});

  function revoke(id: number) {
    const url = map.value[id]?.url;
    if (url) URL.revokeObjectURL(url);
  }

  async function load(id: number) {
    const prev = map.value[id];
    if (prev?.url || prev?.loading || prev?.error) return;
    map.value[id] = { url: undefined, loading: true, error: false };
    try {
      const url = await fetchVideoSnapshotUrl(id);
      map.value[id] = { url, loading: false, error: false };
    } catch {
      map.value[id] = { url: undefined, loading: false, error: true };
    }
  }

  watch(
    ids,
    (next) => {
      for (const id of next) load(id);
    },
    { immediate: true },
  );

  onUnmounted(() => {
    for (const id of Object.keys(map.value)) revoke(Number(id));
  });

  return { map };
}

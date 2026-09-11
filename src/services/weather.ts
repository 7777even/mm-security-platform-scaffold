import { request } from '@/services/http';
import { backendUnavailableWarn, REASON_CONTRACT_MISMATCH } from '@/services/backendFallback';

// 天气观测/预报接口，对齐 docs/api/weather.openapi.json。
// 取代 weatherMock 中的硬编码业务数据。

export type WeatherMetric = 'rain' | 'wind' | 'temperature' | 'pressure' | 'humidity';

export interface CurrentWeather {
  temperature: number;
  condition: string;
  airQuality: number;
  airQualityLevel: string;
  windDirection: string;
  windSpeed: string;
  windLevel: string;
  humidity: string;
  pressure: string;
  visibility: string;
  rainfall: string;
  updatedAt: string;
}

export interface HourlyWeatherItem {
  time: string;
  rain: number;
  wind: number;
  temperature: number;
  pressure: number;
  humidity: number;
}

export interface DailyWeatherItem {
  day: string;
  date: string;
  condition: string;
  icon: string;
  high: number;
  low: number;
  wind: string;
  humidity: number;
  rain: number;
}

export interface WeatherOverview {
  current: CurrentWeather;
  hourly: HourlyWeatherItem[];
  daily: DailyWeatherItem[];
}

/** 后端不可用时的空态（绝不回灌假数据）。 */
const EMPTY_WEATHER: WeatherOverview = {
  current: {
    temperature: 0,
    condition: '',
    airQuality: 0,
    airQualityLevel: '',
    windDirection: '',
    windSpeed: '',
    windLevel: '',
    humidity: '',
    pressure: '',
    visibility: '',
    rainfall: '',
    updatedAt: '',
  },
  hourly: [],
  daily: [],
};

/** 天气观测与预报聚合：实时观测 + 逐时 + 逐日。 */
export async function fetchWeatherOverview(): Promise<WeatherOverview> {
  try {
    const data = await request<WeatherOverview>({ url: '/weather/overview', method: 'GET' });
    if (!data || !data.current) {
      backendUnavailableWarn('weather', '/weather/overview', REASON_CONTRACT_MISMATCH);
      return EMPTY_WEATHER;
    }
    return data;
  } catch {
    backendUnavailableWarn('weather', '/weather/overview');
    return EMPTY_WEATHER;
  }
}

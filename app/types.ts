export interface Params {
  latitude: number;
  longitude: number;
  hourly: string;
  start_date: string;
  end_date: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: {
    time: string;
    temperature_2m: string;
    dew_point_2m: string;
    relative_humidity_2m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    dew_point_2m: number[];
    relative_humidity_2m: number[];
  };
}
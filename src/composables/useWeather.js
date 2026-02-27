import { ref } from 'vue'

const WMO_CODES = {
  0: { label: 'Helder', icon: '☀️' },
  1: { label: 'Overwegend helder', icon: '🌤️' },
  2: { label: 'Gedeeltelijk bewolkt', icon: '⛅' },
  3: { label: 'Bewolkt', icon: '☁️' },
  45: { label: 'Mist', icon: '🌫️' },
  48: { label: 'IJsmist', icon: '🌫️' },
  51: { label: 'Lichte motregen', icon: '🌦️' },
  53: { label: 'Motregen', icon: '🌦️' },
  55: { label: 'Zware motregen', icon: '🌧️' },
  61: { label: 'Lichte regen', icon: '🌧️' },
  63: { label: 'Regen', icon: '🌧️' },
  65: { label: 'Zware regen', icon: '🌧️' },
  71: { label: 'Lichte sneeuw', icon: '🌨️' },
  73: { label: 'Sneeuw', icon: '❄️' },
  75: { label: 'Zware sneeuw', icon: '❄️' },
  77: { label: 'Sneeuwkorrels', icon: '🌨️' },
  80: { label: 'Lichte regenbuien', icon: '🌦️' },
  81: { label: 'Regenbuien', icon: '🌧️' },
  82: { label: 'Zware regenbuien', icon: '⛈️' },
  85: { label: 'Sneeuwbuien', icon: '🌨️' },
  86: { label: 'Zware sneeuwbuien', icon: '❄️' },
  95: { label: 'Onweer', icon: '⛈️' },
  96: { label: 'Onweer met hagel', icon: '⛈️' },
  99: { label: 'Zwaar onweer met hagel', icon: '⛈️' }
}

const DAY_NAMES = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']

export function useWeather() {
  const weather = ref(null)
  const loadingWeather = ref(false)

  const getWeatherInfo = (code) => WMO_CODES[code] ?? { label: 'Onbekend', icon: '🌡️' }

  const fetchWeather = async ({ lat, lng }) => {
    if (!lat || !lng) return
    loadingWeather.value = true

    try {
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lng,
        current: 'temperature_2m,apparent_temperature,weathercode,windspeed_10m,precipitation',
        daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum',
        timezone: 'auto',
        forecast_days: 6
      })

      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      const data = await res.json()

      const current = data.current
      const daily = data.daily

      weather.value = {
        current: {
          temp: Math.round(current.temperature_2m),
          feelsLike: Math.round(current.apparent_temperature),
          wind: Math.round(current.windspeed_10m),
          precipitation: current.precipitation,
          ...getWeatherInfo(current.weathercode)
        },
        forecast: daily.time.slice(1).map((date, i) => {
          const d = new Date(date)
          return {
            day: DAY_NAMES[d.getDay()],
            tempMax: Math.round(daily.temperature_2m_max[i + 1]),
            tempMin: Math.round(daily.temperature_2m_min[i + 1]),
            precipitation: Math.round(daily.precipitation_sum[i + 1] * 10) / 10,
            ...getWeatherInfo(daily.weathercode[i + 1])
          }
        })
      }
    } catch {
      // Silently fail — weather is non-critical
      weather.value = null
    } finally {
      loadingWeather.value = false
    }
  }

  return { weather, loadingWeather, fetchWeather }
}

import { ref } from 'vue'
import { getCurrentInstance } from 'vue'

const loaded = ref(false)
const loading = ref(false)

export function useGoogleMaps() {
  const load = async () => {
    if (loaded.value || loading.value) return
    loading.value = true

    const { default: VueGoogleMaps } = await import('@fawmi/vue-google-maps')
    const instance = getCurrentInstance()
    instance.appContext.app.use(VueGoogleMaps, {
      load: {
        key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: 'places,directions'
      }
    })

    loaded.value = true
    loading.value = false
  }

  return { loaded, loading, load }
}

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import VueGoogleMaps from '@fawmi/vue-google-maps'
import { createHead } from '@unhead/vue/client'

const app = createApp(App)
const head = createHead()

app.use(router)
app.use(head)
app.use(VueGoogleMaps, {
  load: {
    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: 'places,directions'
  }
})

app.mount('#app')

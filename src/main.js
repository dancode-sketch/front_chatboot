import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})

// Directiva de roles: muestra/oculta elementos según roles del usuario
import { useAuthStore } from '@/stores/auth'
app.directive('role', {
  mounted(el, binding) {
    const authStore = useAuthStore()
    const requiredRoles = Array.isArray(binding.value)
      ? binding.value
      : [binding.value]

    if (!authStore.hasAnyRole(requiredRoles)) {
      el.style.display = 'none'
    }
  },
})

app.mount('#app')

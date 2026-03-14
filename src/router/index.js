import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuthMotorizadoStore } from '@/stores/authMotorizado'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Login Admin
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    // Login Motorizado
    {
      path: '/motorizado/login',
      name: 'motorizado-login',
      component: () => import('@/views/motorizado/LoginMotorizadoView.vue'),
      meta: { requiresAuth: false }
    },
    // Panel Motorizado
    {
      path: '/motorizado/panel',
      name: 'motorizado-panel',
      component: () => import('@/views/motorizado/PanelDeliveryView.vue'),
      meta: { requiresMotorizadoAuth: true }
    },
    // Dashboard Admin
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      redirect: '/dashboard/kds',
      children: [
        {
          path: 'kds',
          name: 'kds',
          component: () => import('@/views/KdsView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'chat',
          name: 'chat',
          component: () => import('@/views/ChatView.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    // Admin Routes
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      redirect: '/admin/motorizados',
      children: [
        {
          path: 'motorizados',
          name: 'admin-motorizados',
          component: () => import('@/views/admin/MotorizadosView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'asignacion-pedidos',
          name: 'admin-asignacion',
          component: () => import('@/views/admin/AsignacionPedidosView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/views/admin/SettingsView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'catalog/categories',
          name: 'admin-categories',
          component: () => import('@/views/admin/CategoriesView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'catalog/products',
          name: 'admin-products',
          component: () => import('@/views/admin/ProductsView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'delivery',
          name: 'admin-delivery',
          component: () => import('@/views/admin/DeliveryConfigView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'templates',
          name: 'admin-templates',
          component: () => import('@/views/admin/TemplatesView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'pedidos',
          name: 'admin-pedidos',
          component: () => import('@/views/admin/NewOrderPanel.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        }
      ]
    },
    // Redirects
    {
      path: '/',
      redirect: '/dashboard/kds'
    }
  ]
})

// Guard de autenticación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const authMotorizadoStore = useAuthMotorizadoStore()
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresMotorizadoAuth = to.matched.some(record => record.meta.requiresMotorizadoAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  // debug
  // console.log('guard:', { requiresAuth, requiresMotorizadoAuth, requiresAdmin, user: authStore.user })
  
  // Rutas de Motorizado
  if (requiresMotorizadoAuth && !authMotorizadoStore.isAuthenticated) {
    next('/motorizado/login')
  } else if (to.path === '/motorizado/login' && authMotorizadoStore.isAuthenticated) {
    next('/motorizado/panel')
  }
  // Rutas de Admin
  else if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (requiresAdmin && !authStore.isAdmin) {
    // usuario autenticado pero no es administrador
    console.warn('acceso admin negado, rol actual:', authStore.user?.role)
    next('/dashboard/kds')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard/kds')
  }
  // Ruta no encontrada - redirigir según el origen
  else if (to.matched.length === 0) {
    // Si viene de una ruta de motorizado o está intentando acceder una, redirigir al login de motorizado
    if (from.path.startsWith('/motorizado') || to.path.startsWith('/motorizado')) {
      next('/motorizado/login')
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router

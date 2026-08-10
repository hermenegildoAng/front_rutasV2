import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../services/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiereInvitado: true } 
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiereAutenticacion: true } 
    },
    {
      path: '/rutas-inventario',
      name: 'ListaRutas',
      redirect: '/dashboard',
      meta: { requiereAutenticacion: true }
    },
    
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

router.beforeEach((to) => {
  const tieneSesion = isAuthenticated()
  if (to.meta.requiereAutenticacion && !tieneSesion) {
    return { name: 'login' }
  }

  if (to.meta.requiereInvitado && tieneSesion) {
    return { name: 'dashboard' }
  }
})

export default router

import { createRouter, createWebHistory } from 'vue-router'

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
      component: () => import('../components/InventarioRutasComponent.vue'),
      meta: { requiereAutenticacion: true }
    },
    
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

router.beforeEach((to) => {
  const rolUsuario = localStorage.getItem('user-rol')

  
  if (to.meta.requiereAutenticacion && !rolUsuario) {
    return { name: 'login' }
  }

  
  if (to.meta.requiereInvitado && rolUsuario) {
    return { name: 'dashboard' }
  }

})

export default router
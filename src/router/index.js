import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiereInvitado: true } // Solo accesibles si NO estás logueado
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiereAutenticacion: true } // Solo accesibles si SÍ estás logueado
    },
    // Redirección por defecto si meten una URL que no existe
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

// 🔐 Guardián de Seguridad Global (Navigation Guard)
router.beforeEach((to, from, next) => {
  const rolUsuario = localStorage.getItem('user-rol')

  // Caso 1: La ruta requiere autenticación y el usuario no está logueado
  if (to.meta.requiereAutenticacion && !rolUsuario) {
    return next({ name: 'login' })
  }

  // Caso 2: El usuario ya está logueado e intenta ir al Login
  if (to.meta.requiereInvitado && rolUsuario) {
    return next({ name: 'dashboard' })
  }

  // Si todo está en orden, prosigue la navegación normal
  next()
})

export default router
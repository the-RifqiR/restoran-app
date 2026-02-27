import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import KasirDashboard from '../views/KasirDashboard.vue'
import LoginPage from '../views/LoginPage.vue'
import MejaStatus from '@/views/MejaStatus.vue';
import TransaksiPage from '@/views/TransaksiPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/kasir',
    name: 'KasirDashboard',
    component: KasirDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/transaksi',
    name: 'TransaksiDashboard',
    component: TransaksiPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/meja',
    name: 'MejaDashboard',
    component: MejaStatus,
    meta: { requiresAuth: true }
  },
  {
  path: '/menu',
  name: 'MenuResto',
  component: () => import('@/views/MenuPage.vue'), // Lazy load
  meta: { requiresAuth: true }
},
  {
  path: '/transaksi/detail/:id', // :id adalah ID Transaksi dari Laravel
  name: 'TransaksiDetail',
  component: () => import('@/views/TransaksiDetail.vue'),
  meta: { requiresAuth: true }
},
{
    path: '/manager/dashboard',
    name: 'DashboardManager',
    component: () => import('@/views/manager/ManagerDashboard.vue'), // Halaman baru kamu
    meta: { requiresAuth: true, role: 'manager' }
  },
  {
    path: '/owner/dashboard',
    name: 'DashboardOwner',
    component: () => import('@/views/owner/DashboardOwner.vue'),
    meta: { requiresAuth: true, role: 'owner' }
  },
  {
  path: '/manager/menu',
  name: 'ManajemenMenu',
  component: () => import('@/views/manager/ManagerMenu.vue'),
  meta: { requiresAuth: true, role: 'manager' }
},{
  path: '/manager/kategori',
  name: 'ManajemenKategori',
  component: () => import('@/views/manager/ManagerKategori.vue'),
  meta: { requiresAuth: true, role: 'manager' }
},
{
  path: '/manager/meja',
  name: 'ManajemenMeja',
  component: () => import('@/views/manager/ManagerMeja.vue'),
  meta: { requiresAuth: true, role: 'manager' }
},
{
  path: '/manager/transaksi',
  name: 'ManajemenTransaksi',
  component: () => import('@/views/manager/ManagerTransaksi.vue'),
  meta: { requiresAuth: true, role: 'manager' }
},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');
  
  // Jika butuh auth tapi belum login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  } 

  // Jika sudah login tapi mencoba akses halaman yang bukan rolenya
  if (to.meta.role && to.meta.role !== userRole) {
    // Kembalikan ke dashboard masing-masing jika nyasar
    if (userRole === 'owner') return next('/owner/dashboard');
    if (userRole === 'manager') return next('/manager/dashboard');
    return next('/kasir');
  }

  next();
});

export default router;

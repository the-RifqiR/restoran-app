<template>
  <ion-menu content-id="main-content" type="overlay" class="custom-menu">
    <ion-header class="ion-no-border">
      <ion-toolbar class="menu-header-toolbar">
        <div class="user-profile-section">
          <div class="profile-avatar">
            <ion-icon :icon="personCircleOutline"></ion-icon>
          </div>
          <div class="profile-info">
            <h3>{{ userData.username || 'User' }}</h3>
            <p>
              <span class="online-status"></span>
              <span style="text-transform: capitalize;">{{ userRole }}</span>
            </p>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="menu-content">
      <div class="menu-label">MENU UTAMA</div>

      <ion-list lines="none" class="menu-list">
        <ion-menu-toggle :auto-hide="false" v-for="page in menuPages" :key="page.title">
          <ion-item button :router-link="page.url" router-direction="root" detail="false" class="nav-item"
            active-class="nav-active">
            <div class="icon-box">
              <ion-icon :icon="page.icon"></ion-icon>
            </div>
            <ion-label>{{ page.title }}</ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>

      <div class="menu-footer">
        <button class="logout-action" @click="$emit('logout')">
          <ion-icon :icon="logOutOutline"></ion-icon>
          <span>Keluar Sistem</span>
        </button>
      </div>
    </ion-content>
  </ion-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  IonMenu, IonHeader, IonToolbar, IonContent,
  IonList, IonItem, IonIcon, IonLabel, IonMenuToggle
} from '@ionic/vue';
import {
  gridOutline, restaurantOutline, fastFoodOutline,
  receiptOutline, logOutOutline, personCircleOutline,
  // 2. Tambahkan icon yang kurang di sini
  pieChartOutline, barChartOutline
} from 'ionicons/icons';

defineEmits(['logout']);

const userRole = localStorage.getItem('user_role') || '';
const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

const allPages = [
  { title: 'Dashboard Kasir', url: '/kasir', icon: gridOutline, roles: ['kasir'] },
  { title: 'Dashboard Owner', url: '/owner/dashboard', icon: pieChartOutline, roles: ['owner'] },
  { title: 'Dashboard Manager', url: '/manager/dashboard', icon: barChartOutline, roles: ['manager'] },
  { title: 'Status Meja', url: '/meja', icon: restaurantOutline, roles: ['kasir'] },
  { title: 'Manajemen Meja', url: '/manager/meja', icon: restaurantOutline, roles: ['manager'] },
  { title: 'Menu Resto', url: '/menu', icon: fastFoodOutline, roles: ['kasir'] },
  { title: 'Manajemen Menu', url: '/manager/menu', icon: fastFoodOutline, roles: ['manager'] },
  { title: 'Manajemen Kategori', url: '/manager/kategori', icon: fastFoodOutline, roles: ['manager'] },
  { title: 'Billing', url: '/transaksi', icon: receiptOutline, roles: ['kasir'] },
  { title: 'Pantau Transaksi', url: '/manager/transaksi', icon: receiptOutline, roles: ['manager', 'owner'] },
];

const menuPages = computed(() => {
  // Gunakan filter untuk mencocokkan role user dengan daftar roles di tiap halaman
  return allPages.filter(page => page.roles.includes(userRole));
});
</script>


<style scoped>
/* Container Utama Sidebar */
.custom-menu {
  --width: 280px;
}

.menu-content {
  --background: #0f172a;
  /* Slate 900 */
  display: flex;
  flex-direction: column;
}

/* Header & Profile */
.menu-header-toolbar {
  --background: #0f172a;
  --padding-top: 30px;
  --padding-bottom: 20px;
}

.user-profile-section {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(to right, rgba(16, 185, 129, 0.1), transparent);
  border-radius: 0 50px 50px 0;
  margin-right: 20px;
}

.profile-avatar {
  font-size: 40px;
  color: #10b981;
}

.profile-info h3 {
  margin: 0;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.profile-info p {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.online-status {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 5px #10b981;
}

/* Label Grup Menu */
.menu-label {
  padding: 20px 25px 10px;
  font-size: 11px;
  font-weight: 800;
  color: #475569;
  letter-spacing: 1.5px;
}

/* Navigasi Items */
.menu-list {
  background: transparent;
  padding: 0 12px;
}
.nav-item {
  --background: transparent;
  --color: #94a3b8;
  --border-radius: 16px;
  --padding-start: 12px;
  margin-bottom: 5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Transisi lebih halus */
  cursor: pointer;
}

/* Hover State (Hanya untuk menu yang tidak aktif) */
.nav-item:not(.nav-active):hover {
  --background: rgba(255, 255, 255, 0.03); /* Efek highlight tipis */
  --color: #f8fafc; /* Teks jadi lebih terang */
  transform: translateX(5px); /* Geser sedikit ke kanan */
}

.nav-item:not(.nav-active):hover .icon-box {
  background: rgba(148, 163, 184, 0.15);
  color: #10b981; /* Ikon berubah jadi emerald saat hover */
}

/* Penyesuaian Nav Active agar tidak goyang saat hover */
.nav-active:hover {
  transform: none; /* Menu aktif tidak perlu bergeser lagi */
}

/* Logout Action Hover */
.logout-action:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

/* Footer & Logout */
.menu-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to top, #0f172a 80%, transparent);
}

.logout-action {
  width: 100%;
  padding: 15px;
  border-radius: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.3s;
}

.logout-action:active {
  background: #ef4444;
  color: white;
}
</style>
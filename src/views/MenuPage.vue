<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="dark"></ion-menu-button>
        </ion-buttons>
        <ion-title>MANAGEMENT <span>INVENTORY</span></ion-title>
      </ion-toolbar>

      <div class="header-control">
        <div class="search-container">
          <ion-icon :icon="searchOutline" class="search-icon"></ion-icon>
          <input type="text" placeholder="Cari menu favorit..." v-model="searchQuery" class="custom-search-input" />
        </div>
      </div>
    </ion-header>

    <ion-content class="inventory-content">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="menu-grid">
        <div v-for="menu in filteredMenus" :key="menu.id" class="menu-card-v2">
          <div class="card-pattern"></div>

          <div class="card-content">
            <div class="top-section">
              <div class="badge-wrapper">
                <span :class="['status-pill', menu.status === 'tersedia' ? 'pill-green' : 'pill-red']">
                  {{ menu.status }}
                </span>
              </div>
              <h3 class="menu-name">{{ menu.nama_menu }}</h3>
              <p class="menu-price">Rp {{ formatNumber(menu.harga) }}</p>
            </div>

            <div class="bottom-section">
              <div class="stok-info">
                <div class="stok-circle">
                  <span class="stok-val">{{ menu.stok }}</span>
                  <span class="stok-unit">Unit</span>
                </div>
                <div class="stok-text">
                  <span class="label">Persediaan</span>
                  <span class="sub-label">{{ menu.stok > 5 ? 'Stok Aman' : 'Hampir Habis' }}</span>
                </div>
              </div>

              <button class="action-btn-restock" @click="openRestockModal(menu)">
                <ion-icon :icon="flashOutline"></ion-icon>
                Restock
              </button>
            </div>
          </div>
        </div>
      </div>

      <ion-modal :is-open="isModalOpen" :initial-breakpoint="0.7" :breakpoints="[0, 0.7, 1]" class="modern-modal">
        <div class="modal-body">
          <div class="modal-header">
            <div class="icon-box">
              <ion-icon :icon="cubeOutline"></ion-icon>
            </div>
            <h2>Update Persediaan</h2>
            <p>{{ selectedMenu?.nama_menu }}</p>
          </div>

          <div class="input-section">
            <label>Tambah Jumlah Porsi</label>
            <div class="input-wrapper">
              <input type="number" v-model="jumlahTambah" placeholder="Contoh: 10" />
              <span class="suffix">Portion</span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="isModalOpen = false">Batal</button>
            <button class="btn-confirm" :disabled="isSubmitting" @click="submitRestock">
              <ion-spinner v-if="isSubmitting" name="dots"></ion-spinner>
              <span v-else>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonSearchbar, IonRefresher, IonRefresherContent,
  IonButton, IonIcon, IonModal, IonItem, IonLabel, IonInput,
  IonSpinner, toastController
} from '@ionic/vue';
import { searchOutline, flashOutline, cubeOutline } from 'ionicons/icons';
import api from '@/services/api';

const menus = ref<any[]>([]);
const searchQuery = ref('');
const isModalOpen = ref(false);
const isSubmitting = ref(false);
const selectedMenu = ref<any>(null);
const jumlahTambah = ref(0);

// Load Data
const loadMenus = async () => {
  try {
    const response = await api.get('/menus');
    menus.value = response.data.data;
  } catch (error) {
    console.error(error);
  }
};

// Filter Search
const filteredMenus = computed(() => {
  return menus.value.filter(m =>
    m.nama_menu.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Logic Restock
const openRestockModal = (menu: any) => {
  selectedMenu.value = menu;
  jumlahTambah.value = 0;
  isModalOpen.value = true;
};

const submitRestock = async () => {
  if (jumlahTambah.value <= 0) {
    const toast = await toastController.create({ message: 'Jumlah harus lebih dari 0', duration: 2000, color: 'warning' });
    return toast.present();
  }

  isSubmitting.value = true;
  try {
    // Sesuai dengan controller Laravel: POST /api/menus/{id}/restock
    await api.post(`/menus/${selectedMenu.value.id}/restock`, {
      jumlah_tambah: jumlahTambah.value,
      jenis: 'restock' // Hardcoded karena kasir hanya boleh restock, bukan stok_awal
    });

    const toast = await toastController.create({ message: 'Stok berhasil ditambah!', duration: 2000, color: 'success' });
    toast.present();

    isModalOpen.value = false;
    loadMenus(); // Refresh data
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Gagal update stok';
    const toast = await toastController.create({ message: msg, duration: 2000, color: 'danger' });
    toast.present();
  } finally {
    isSubmitting.value = false;
  }
};

const handleRefresh = async (event: any) => {
  await loadMenus();
  event.target.complete();
};

const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

onMounted(loadMenus);
</script>

<style scoped>
/* 1. Header & Toolbar */
.main-toolbar {
  --background: #ffffff;
  --border-width: 0;
  padding-top: 8px;
}

ion-title {
  font-weight: 900;
  font-size: 12px;
  color: #94a3b8;
  letter-spacing: 2px;
  text-transform: uppercase;
}

ion-title span {
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 2. Custom Search */
.header-control {
  background: white;
  padding: 10px 20px 20px;
}

.search-container {
  background: #f1f5f9;
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border: 1px solid transparent;
  transition: 0.3s;
}

.search-container:focus-within {
  border-color: #10b981;
  background: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.search-icon {
  color: #64748b;
  font-size: 20px;
}

.custom-search-input {
  border: none;
  background: transparent;
  padding: 14px;
  width: 100%;
  outline: none;
  font-weight: 600;
  color: #1e293b;
}

/* 3. Menu Card V2 */
.menu-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.menu-card-v2 {
  background: white;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.03);
}

.card-pattern {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  background: #10b981;
  opacity: 0.03;
  border-radius: 50%;
}

.card-content {
  padding: 20px;
  position: relative;
  z-index: 1;
}

.top-section {
  margin-bottom: 20px;
}

.status-pill {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 100px;
  letter-spacing: 0.5px;
}

.pill-green {
  background: #ecfdf5;
  color: #10b981;
}

.pill-red {
  background: #fef2f2;
  color: #ef4444;
}

.menu-name {
  margin: 8px 0 2px;
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}

.menu-price {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
}

.bottom-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 12px;
  border-radius: 18px;
}

.stok-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stok-circle {
  background: white;
  width: 45px;
  height: 45px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.stok-val {
  font-weight: 900;
  color: #0f172a;
  font-size: 15px;
  line-height: 1;
}

.stok-unit {
  font-size: 8px;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
}

.label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
}

.sub-label {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
}

.action-btn-restock {
  background: #0f172a;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.3s;
}

.action-btn-restock:active {
  transform: scale(0.95);
  opacity: 0.9;
}

/* 4. Modern Modal */
.modern-modal {
  --height: auto;
  --border-radius: 32px;
  --background: #ffffff;
  padding: 20px;
}

.modal-body {
  padding: 30px 24px;
  text-align: center;
}

.icon-box {
  background: #f1f5f9;
  width: 60px;
  height: 60px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 24px;
  color: #0f172a;
}

.modal-header h2 {
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}

.modal-header p {
  color: #10b981;
  font-weight: 700;
  margin-top: 4px;
}

.input-section {
  margin: 24px 0;
  text-align: left;
}

.input-section label {
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  margin-left: 4px;
}

.input-wrapper {
  background: #f1f5f9;
  color: #0b0b0b;
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  margin-top: 8px;
}

.input-wrapper input {
  background: transparent;
  border: none;
  padding: 16px 0;
  font-size: 18px;
  font-weight: 800;
  width: 100%;
  outline: none;
}

.suffix {
  font-weight: 700;
  color: #94a3b8;
  font-size: 12px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.btn-cancel {
  flex: 1;
  padding: 16px;
  border-radius: 16px;
  border: none;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
}

.btn-confirm {
  flex: 2;
  padding: 16px;
  border-radius: 16px;
  border: none;
  font-weight: 700;
  color: white;
  background: #0f172a;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2);
}

.inventory-content {
  --background: #F8FAFC;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

@media (max-width: 576px) {
  .inventory-content {
    padding: 14px;
  }

  .menu-card-v2 {
    border-radius: 20px;
  }

  .card-content {
    padding: 16px;
  }

  .menu-name {
    font-size: 16px;
  }

  .menu-price {
    font-size: 13px;
  }

  .bottom-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .action-btn-restock {
    width: 100%;
    justify-content: center;
  }

  .header-control {
    padding: 10px 14px 16px;
  }

  .custom-search-input {
    padding: 12px;
    font-size: 14px;
  }

}

/* Tablet */
@media (min-width: 640px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .menu-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop */
@media (min-width: 1400px) {
  .menu-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
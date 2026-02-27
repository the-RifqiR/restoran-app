<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        
        <ion-title>PRODUCT <span>CATALOG</span></ion-title>
        
        <ion-buttons slot="end">
          <button class="btn-history-top" @click="isHistoryModalOpen = true">
            <ion-icon :icon="timeOutline"></ion-icon>
          </button>
          <button class="btn-add-menu" @click="openModalAdd()">
            <ion-icon :icon="addOutline"></ion-icon>
            <span>Tambah</span>
          </button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding gray-bg">
      <div class="menu-list-container">
        <div v-for="menu in menus" :key="menu.id" class="modern-menu-card">
          <div class="card-left">
            <div class="img-frame">
              <img :src="menu.foto_makanan_url || 'https://placehold.co/100'" />
            </div>
          </div>
          
          <div class="card-center">
            <div class="meta-row">
              <span class="cat-badge" v-if="menu.kategori">{{ menu.kategori.nama }}</span>
              <span class="stok-indicator" :class="menu.stok < 10 ? 'low' : 'safe'">
                Stok: {{ menu.stok }}
              </span>
            </div>
            <h2 class="menu-name">{{ menu.nama_menu }}</h2>
            <p class="menu-price">Rp {{ menu.harga.toLocaleString() }}</p>
          </div>

          <div class="card-right">
            <button class="mini-action edit" @click="openModalEdit(menu)">
              <ion-icon :icon="createOutline"></ion-icon>
            </button>
            <button class="mini-action stock" @click="openModalStok(menu)">
              <ion-icon :icon="cubeOutline"></ion-icon>
            </button>
            <button class="mini-action delete" @click="deleteMenu(menu.id)">
              <ion-icon :icon="trashOutline"></ion-icon>
            </button>
          </div>
        </div>
      </div>

      <ion-modal :is-open="isMenuModalOpen" @didDismiss="isMenuModalOpen = false" class="modern-modal">
        <div class="modal-body luxury-form">
          <div class="indicator-bar"></div>
          <div class="form-header">
            <h3>{{ isEditMode ? 'Update Product' : 'Create Product' }}</h3>
            <p>Lengkapi detail informasi menu di bawah ini</p>
          </div>

          <div class="input-group">
            <label>Nama Produk</label>
            <input type="text" v-model="menuForm.nama_menu" placeholder="Masukkan nama menu..." />
          </div>

          <div class="input-group">
            <label>Kategori</label>
            <select v-model="menuForm.kategoris_id" class="custom-select">
              <option :value="null" disabled>Pilih Kategori</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.nama }}</option>
            </select>
          </div>

          <div class="input-group">
            <label>Harga (Rp)</label>
            <input type="number" v-model="menuForm.harga" />
          </div>

          <div class="input-group">
            <label>Deskripsi (Opsional)</label>
            <textarea v-model="menuForm.deskripsi" rows="3"></textarea>
          </div>

          <button class="btn-main" @click="submitMenu()">
            {{ isEditMode ? 'Simpan Perubahan' : 'Terbitkan Menu' }}
          </button>
        </div>
      </ion-modal>

      <ion-modal :is-open="isStokModalOpen" @didDismiss="isStokModalOpen = false" class="stok-modal">
        <div class="modal-body text-center">
          <div class="icon-circle-amber">
            <ion-icon :icon="cubeOutline"></ion-icon>
          </div>
          <h3>Update Inventory</h3>
          <p class="subtitle">{{ selectedMenu?.nama_menu }}</p>

          <div class="input-group mt-20">
            <label>Jumlah Unit / Porsi</label>
            <input type="number" v-model="stokForm.jumlah_tambah" class="text-center big-input" />
          </div>

          <div class="radio-group-modern">
            <button :class="{active: stokForm.jenis === 'restock'}" @click="stokForm.jenis = 'restock'">
              Restock
            </button>
            <button :class="{active: stokForm.jenis === 'stok_awal'}" @click="stokForm.jenis = 'stok_awal'">
              Reset / Awal
            </button>
          </div>

          <button class="btn-main amber-bg" @click="submitStok()">Konfirmasi Stok</button>
        </div>
      </ion-modal>

      <ion-modal :is-open="isHistoryModalOpen" @didDismiss="isHistoryModalOpen = false" class="history-modal">
        <div class="modal-wrapper">
          <div class="modal-header-luxury">
            <div class="indicator"></div>
            <div class="header-content">
              <div class="icon-box-history">
                <ion-icon :icon="timeOutline"></ion-icon>
              </div>
              <div class="title-area">
                <h3>Inventory Log</h3>
                <p>Aktivitas perubahan stok produk</p>
              </div>
            </div>
          </div>

          <div class="history-scroll-area">
            <div v-if="stockHistory.length === 0" class="empty-state">
              <ion-icon :icon="cubeOutline"></ion-icon>
              <p>Belum ada riwayat update</p>
            </div>

            <div v-else class="timeline-container">
              <div v-for="log in stockHistory" :key="log.id" class="timeline-item">
                <div class="timeline-marker" :class="log.jenis_update"></div>
                <div class="timeline-content-card">
                  <div class="card-top">
                    <span class="timestamp">{{ formatDate(log.waktu_update) }}</span>
                    <div class="action-tag" :class="log.jenis_update">
                      {{ log.jenis_update === 'restock' ? 'RESTOCK' : 'INITIAL' }}
                    </div>
                  </div>
                  <div class="card-main">
                    <h4>{{ log.nama_menu }}</h4>
                    <div class="value-pill" :class="log.jenis_update">
                      <ion-icon :icon="addOutline" v-if="log.jenis_update === 'restock'"></ion-icon>
                      <span>{{ log.jumlah_ditambahkan }} Porsi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer-luxury">
            <button class="btn-close-luxury" @click="isHistoryModalOpen = false">Selesai</button>
          </div>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'; 
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButtons, 
  IonMenuButton, IonModal
} from '@ionic/vue';
import { addOutline, createOutline, trashOutline, cubeOutline, timeOutline } from 'ionicons/icons';
import api from '@/services/api';

// --- DATA STATES ---
const menus = ref<any[]>([]);
const categories = ref<any[]>([]); 
const isMenuModalOpen = ref(false);
const isStokModalOpen = ref(false);
const isHistoryModalOpen = ref(false);
const isEditMode = ref(false);
const selectedMenu = ref<any>(null);
const stockHistory = ref([]);

// --- FORMS ---
const menuForm = ref({
  id: null,
  nama_menu: '',
  harga: 0,
  deskripsi: '',
  status: 'tersedia',
  kategoris_id: null as number | null 
});

const stokForm = ref({
  jumlah_tambah: 0,
  jenis: 'restock'
});

// --- LOGIC ---
const loadData = async () => {
  try {
    const [resMenu, resCat] = await Promise.all([
      api.get('/menus'),
      api.get('/kategoris') 
    ]);
    menus.value = resMenu.data.data;
    categories.value = resCat.data.data;
  } catch (error) {
    console.error("Gagal memuat data", error);
  }
};

const loadStockHistory = async () => {
  try {
    const res = await api.get('/laporan-stok');
    stockHistory.value = res.data.data;
  } catch (error) {
    console.error("Gagal ambil history", error);
  }
};

watch(isHistoryModalOpen, (val) => { if (val) loadStockHistory(); });

const openModalAdd = () => {
  isEditMode.value = false;
  menuForm.value = { id: null, nama_menu: '', harga: 0, deskripsi: '', status: 'tersedia', kategoris_id: null };
  isMenuModalOpen.value = true;
};

const openModalEdit = (menu: any) => {
  isEditMode.value = true;
  selectedMenu.value = menu;
  menuForm.value = { ...menu, kategoris_id: menu.kategori?.id || null };
  isMenuModalOpen.value = true;
};

const openModalStok = (menu: any) => {
  selectedMenu.value = menu;
  stokForm.value = { jumlah_tambah: 0, jenis: 'restock' };
  isStokModalOpen.value = true;
};

const submitMenu = async () => {
  try {
    if (isEditMode.value) {
      await api.put(`/menus/${selectedMenu.value.id}`, menuForm.value);
    } else {
      await api.post('/menus', { ...menuForm.value, stok: 0 }); 
    }
    isMenuModalOpen.value = false;
    loadData();
  } catch (error) { console.error("Gagal simpan", error); }
};

const submitStok = async () => {
  try {
    await api.post(`/menus/${selectedMenu.value.id}/restock`, stokForm.value);
    isStokModalOpen.value = false;
    loadData();
  } catch (error) { console.error("Gagal update stok", error); }
};

const deleteMenu = async (id: number) => {
  if (confirm('Hapus menu ini?')) {
    try {
      await api.delete(`/menus/${id}`);
      loadData();
    } catch (error) { console.error("Gagal hapus", error); }
  }
};

const formatDate = (ds: string) => {
  if (!ds) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ds));
};

onMounted(loadData);
</script>

<style scoped>
/* --- 1. THEME & TOOLBAR --- */
.gray-bg { --background: #F8FAFC; }
.main-toolbar { --background: #ffffff; padding-top: 8px; }
ion-title { font-weight: 900; font-size: 11px; color: #94a3b8; letter-spacing: 2px; }
ion-title span { color: #0f172a; }

/* --- 2. MENU CARDS --- */
.modern-menu-card {
  background: white; border-radius: 24px; padding: 16px; display: flex; align-items: center; gap: 16px;
  margin-bottom: 12px; border: 1px solid rgba(226,232,240,0.6); box-shadow: 0 4px 15px rgba(15,23,42,0.02);
}
.img-frame { width: 70px; height: 70px; border-radius: 20px; overflow: hidden; border: 2px solid #f1f5f9; }
.img-frame img { width: 100%; height: 100%; object-fit: cover; }
.card-center { flex: 1; }
.menu-name { margin: 0; font-size: 16px; font-weight: 850; color: #0f172a; }
.menu-price { margin: 2px 0 0; font-size: 14px; color: #64748b; font-weight: 600; }
.cat-badge { background: #f1f5f9; color: #64748b; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; }
.stok-indicator { font-size: 10px; font-weight: 800; margin-left: 8px; }
.stok-indicator.low { color: #e11d48; }
.stok-indicator.safe { color: #10b981; }

/* --- 3. ACTIONS --- */
.card-right { display: flex; flex-direction: column; gap: 6px; }
.mini-action { width: 32px; height: 32px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.edit { background: #eff6ff; color: #3b82f6; }
.stock { background: #fff7ed; color: #f59e0b; }
.delete { background: #fff1f2; color: #e11d48; }
.btn-add-menu { background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 12px; display: flex; align-items: center; gap: 8px; font-weight: 700; margin-right: 12px; }
.btn-history-top { background: #f1f5f9; color: #64748b; border: none; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 8px; }

/* --- 4. FORM & MODALS --- */
.modern-modal { --height: 85%; --border-radius: 32px; }
.stok-modal { --height: auto; --border-radius: 32px; --align-items: center; }
.modal-body { padding: 32px 24px; }
.indicator-bar { width: 40px; height: 4px; background: #e2e8f0; border-radius: 10px; margin: 0 auto 20px; }
.form-header h3 { margin: 0; font-size: 20px; font-weight: 900; color: #0f172a; }
.form-header p { margin: 4px 0 20px; font-size: 13px; color: #94a3b8; }

.input-group { margin-bottom: 20px; text-align: left; }
.input-group label { display: block; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin: 0 0 8px 4px; }
.input-group input, .custom-select, .input-group textarea {
  width: 100%; background: #f1f5f9; border: 1.5px solid #e2e8f0; padding: 14px; border-radius: 16px; font-weight: 600; color: #0f172a; outline: none;
}
.big-input { font-size: 24px; font-weight: 900; }

.radio-group-modern { display: flex; gap: 10px; background: #f1f5f9; padding: 6px; border-radius: 14px; margin-bottom: 20px; }
.radio-group-modern button { flex: 1; padding: 12px; border: none; border-radius: 10px; font-weight: 700; font-size: 12px; color: #94a3b8; background: transparent; }
.radio-group-modern button.active { background: white; color: #0f172a; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

.btn-main { width: 100%; padding: 18px; border-radius: 18px; border: none; background: #0f172a; color: white; font-weight: 700; }
.amber-bg { background: #f59e0b; }
.icon-circle-amber { width: 64px; height: 64px; background: #fff7ed; color: #f59e0b; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px; }

/* --- 5. TIMELINE LOG --- */
/* --- 5. TIMELINE LOG --- */
.history-modal { --height: 85%; --border-radius: 32px 32px 0 0; }
.modal-wrapper { display: flex; flex-direction: column; height: 100%; background: white; }
.modal-header-luxury { padding: 24px 24px 10px; border-bottom: 1px solid #f1f5f9; }
.header-content { display: flex; align-items: center; gap: 15px; margin-top: 10px; }
.icon-box-history { width: 48px; height: 48px; background: #EEF2FF; color: #4F46E5; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; }

.history-scroll-area { flex: 1; overflow-y: auto; padding: 20px 24px; background: #F8FAFC; }

/* Timeline Core */
.timeline-item { position: relative; padding-left: 24px; border-left: 2px dashed #E2E8F0; margin-left: 10px; padding-bottom: 24px; }
.timeline-marker { 
  position: absolute; left: -7px; top: 0; width: 12px; height: 12px; 
  border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #E2E8F0;
}
.timeline-marker.restock { background: #10B981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2); }
.timeline-marker.stok_awal { background: #6366F1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }

/* Card History */
.timeline-content-card { background: white; border-radius: 20px; padding: 16px; border: 1px solid #E2E8F0; }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.timestamp { font-size: 10px; font-weight: 700; color: #94A3B8; }

/* Tag Atas (Latar Terang, Teks Gelap) */
.action-tag { font-size: 9px; font-weight: 900; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; }
.action-tag.restock { background: #DCFCE7; color: #166534; } /* Hijau Muda */
.action-tag.stok_awal { background: #E0E7FF; color: #3730A3; } /* Biru Muda */

/* Teks Utama */
.card-main h4 { margin: 0; font-size: 15px; font-weight: 800; color: #1E293B; line-height: 1.4; }

/* Pill Jumlah (Warna Solid untuk Penekanan) */
.value-pill { 
  display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; 
  padding: 6px 14px; border-radius: 12px; font-weight: 800; font-size: 12px; color: white; 
}
.value-pill.restock { background: #10B981; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); }
.value-pill.stok_awal { background: #6366F1; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2); }

/* Footer */
.modal-footer-luxury { padding: 20px 24px; background: white; border-top: 1px solid #F1F5F9; }
.btn-close-luxury { 
  width: 100%; padding: 16px; background: #0F172A; color: white; 
  border-radius: 16px; font-weight: 700; border: none; transition: 0.2s;
}
.btn-close-luxury:active { opacity: 0.8; transform: scale(0.98); }
</style>
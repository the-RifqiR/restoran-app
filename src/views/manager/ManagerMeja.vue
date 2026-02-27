<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>MANAJEMEN <span>MEJA</span></ion-title>
        <ion-buttons slot="end">
          <button class="btn-add-modern" @click="openModalAdd()">
            <ion-icon :icon="addOutline"></ion-icon>
            <span>Tambah</span>
          </button>
        </ion-buttons>
      </ion-toolbar>

      <div class="segment-container">
        <ion-segment v-model="viewMode" mode="ios">
          <ion-segment-button value="grid">
            <ion-label>Visual Grid</ion-label>
          </ion-segment-button>
          <ion-segment-button value="table">
            <ion-label>Data Table</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>
    </ion-header>

    <ion-content class="ion-padding gray-bg">
      <div v-if="viewMode === 'grid'" class="meja-grid">
        <div v-for="meja in mejas" :key="meja.id" class="meja-card" :class="meja.status">
          <div class="card-header">
            <div class="table-number">#{{ meja.no_meja }}</div>
            <div class="capacity-tag">
              <ion-icon :icon="peopleOutline"></ion-icon> {{ meja.kapasitas }}
            </div>
          </div>

          <div class="card-body">
            <div class="status-indicator">
              <span class="dot"></span>
              {{ meja.status === 'kosong' ? 'Available' : 'Occupied' }}
            </div>
            <h3 v-if="meja.status === 'terisi'" class="active-info"
              @click="fetchActiveTransaction(meja.id_transaksi_aktif)">
              Lihat Pesanan <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </h3>
          </div>

          <div class="card-footer">
            <button class="action-btn edit" @click="openModalEdit(meja)">
              <ion-icon :icon="createOutline"></ion-icon>
            </button>
            <button class="action-btn delete" @click="deleteMeja(meja.id)">
              <ion-icon :icon="trashOutline"></ion-icon>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="table-card">
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Meja</th>
                <th>Kapasitas</th>
                <th>Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="meja in mejas" :key="meja.id">
                <td class="bold">#{{ meja.no_meja }}</td>
                <td>{{ meja.kapasitas }} Orang</td>
                <td>
                  <span class="status-pill" :class="meja.status" 
                        @click="meja.status === 'terisi' ? fetchActiveTransaction(meja.id_transaksi_aktif) : null">
                    {{ meja.status }}
                  </span>
                </td>
                <td>
                  <div class="action-row">
                    <button class="mini-btn edit" @click="openModalEdit(meja)">
                      <ion-icon :icon="createOutline"></ion-icon>
                    </button>
                    <button class="mini-btn delete" @click="deleteMeja(meja.id)">
                      <ion-icon :icon="trashOutline"></ion-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonModal, IonIcon, IonSegment, IonSegmentButton, IonLabel
} from '@ionic/vue';
import {
  addOutline, createOutline, trashOutline, peopleOutline,
  gridOutline, ellipseOutline, receiptOutline, chevronForwardOutline
} from 'ionicons/icons';
import api from '@/services/api';

const mejas = ref<any[]>([]);
const isModalOpen = ref(false);
const isDetailOpen = ref(false);
const isEditMode = ref(false);
const activeTx = ref<any>(null); // Menyimpan data transaksi yang di-klik
const viewMode = ref('grid');
const mejaForm = ref({
  id: null,
  no_meja: '',
  kapasitas: 2,
  status: 'kosong'
});

const loadMejas = async () => {
  try {
    const res = await api.get('/mejas');
    mejas.value = res.data.data;
  } catch (error) {
    console.error("Gagal load meja", error);
  }
};

const fetchActiveTransaction = async (txId: number) => {
  if (!txId) return;
  try {
    const res = await api.get(`/transaksis/${txId}`);
    activeTx.value = res.data.data;
    isDetailOpen.value = true;
  } catch (error) {
    console.error("Gagal ambil detail transaksi", error);
  }
};

const openModalAdd = () => {
  isEditMode.value = false;
  mejaForm.value = { id: null, no_meja: '', kapasitas: 2, status: 'kosong' };
  isModalOpen.value = true;
};

const openModalEdit = (meja: any) => {
  isEditMode.value = true;
  mejaForm.value = { ...meja };
  isModalOpen.value = true;
};

const submitMeja = async () => {
  try {
    if (isEditMode.value) {
      await api.put(`/mejas/${mejaForm.value.id}`, mejaForm.value);
    } else {
      await api.post('/mejas', mejaForm.value);
    }
    isModalOpen.value = false;
    loadMejas();
  } catch (error: any) {
    alert(error.response?.data?.message || "Gagal menyimpan data");
  }
};

const deleteMeja = async (id: number) => {
  if (confirm("Hapus meja ini?")) {
    try {
      await api.delete(`/mejas/${id}`);
      loadMejas();
    } catch (error) {
      console.error("Gagal hapus");
    }
  }
};

onMounted(loadMejas);
</script>

<style scoped>
/* --- THEME COLORS --- */
.gray-bg {
  --background: #F1F5F9;
}

.main-toolbar {
  --background: #ffffff;
  --border-style: none;
  padding: 10px 5px;
}

/* Judul Toolbar: Span Indigo dipertegas */
ion-title {
  font-weight: 800;
  font-size: 13px;
  color: #475569;
  letter-spacing: 1px;
}

ion-title span {
  color: #4F46E5;
}
.text-order{
  color:#4F46E5;
}
/* --- ADD BUTTON --- */
.btn-add-modern {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.3);
}

/* --- MEJA GRID --- */
.meja-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

/* --- Kalibrasi Warna & Radius --- */
:root {
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --text-main: #1e293b;
  --text-muted: #475569;
  /* Dipergelap dari sebelumnya agar terbaca */
  --text-light: #64748b;
  /* Untuk label kecil */
}

.meja-card {
  background: white;
  border-radius: 24px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
}

.meja-card.terisi {
  border-left: 6px solid #fb7185;
}

.meja-card.kosong {
  border-left: 6px solid #34d399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.table-number {
  font-size: 22px;
  font-weight: 900;
  color: var(--text-main);
}

.capacity-tag {
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  /* Dipergelap */
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 8px;
  color: #475569;
  /* Dipergelap */
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.kosong .dot {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.terisi .dot {
  background: #f43f5e;
  box-shadow: 0 0 8px #f43f5e;
}

.active-info {
  font-size: 13px;
  color: #4F46E5;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-footer {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
}

.action-btn {
  flex: 1;
  border: none;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.edit {
  background: #eef2ff;
  color: #4f46e5;
}

.action-btn.delete {
  background: #fff1f2;
  color: #e11d48;
}

/* --- MODALS --- */
.modern-modal {
  --height: auto;
  --border-radius: 30px;
  --align-items: center;
}

.modal-content {
  padding: 30px 25px;
}

.modal-handle {
  width: 40px;
  height: 5px;
  background: #cbd5e1;
  border-radius: 10px;
  margin: 0 auto 20px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 850;
  color: #0f172a;
  margin: 0;
}

.modal-header p {
  font-size: 13px;
  color: #475569;
  margin: 5px 0 25px;
}

.custom-input-group {
  margin-bottom: 20px;
}

.custom-input-group label {
  font-size: 11px;
  font-weight: 800;
  color: #334155;
  text-transform: uppercase;
  margin-left: 5px;
}

.input-wrapper {
  background: #f8fafc;
  border: 1.5px solid #cbd5e1;
  /* Border diperjelas */
  border-radius: 14px;
  padding: 12px 15px;
  display: flex;
  align-items: center;
}

.input-wrapper ion-icon {
  font-size: 20px;
  color: #475569;
  margin-right: 12px;
}

.input-wrapper input,
.input-wrapper select {
  border: none;
  background: transparent;
  width: 100%;
  outline: none;
  font-weight: 600;
  color: #0f172a;
}

/* Memperbaiki warna placeholder agar terlihat */
.input-wrapper input::placeholder {
  color: #94a3b8;
}

.btn-primary-gradient {
  width: 100%;
  padding: 18px;
  border-radius: 18px;
  border: none;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  font-weight: 800;
  margin-top: 10px;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

/* --- DETAIL TRANSACTION --- */
.detail-modal {
  --height: 65%;
  --border-radius: 32px 32px 0 0;
}

.detail-bg {
  background: white;
  height: 100%;
}

.detail-header-glass {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px dashed #cbd5e1;
}

.icon-circle {
  width: 60px;
  height: 60px;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 30px;
}

.order-id {
  font-size: 12px;
  font-weight: 800;
  color: #475569;
}

.customer-preview {
  display: flex;
  justify-content: space-between;
  margin: 25px 0;
}

.cp-item small {
  font-size: 10px;
  font-weight: 900;
  color: #64748b;
  text-transform: uppercase;
}

.cp-item p {
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0;
  font-size: 15px;
}

.item-list {
  background: #f8fafc;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.order-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #1e293b;
}

.qty {
  font-weight: 900;
  color: #4f46e5;
  margin-right: 10px;
}

.name {
  font-weight: 700;
  color: #334155;
}

.price {
  font-weight: 800;
  color: #0f172a;
}

.btn-close-modern {
  width: 100%;
  padding: 15px;
  border: 1.5px solid #cbd5e1;
  background: white;
  border-radius: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-top: 25px;
}
.segment-container {
  background: white;
  padding: 0 16px 10px;
}

/* Container Table */
.table-card {
  background: white;
  border-radius: 20px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.modern-table th {
  padding: 12px 15px;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 800;
}

.modern-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #1e293b;
}

.modern-table .bold {
  font-weight: 800;
  color: #0f172a;
}

/* Status Pill di dalam Table */
.status-pill {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.status-pill.kosong {
  background: #ecfdf5;
  color: #10b981;
}

.status-pill.terisi {
  background: #fff1f2;
  color: #e11d48;
}

/* Action Buttons di Table */
.action-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.mini-btn {
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-btn.edit { background: #eef2ff; color: #4f46e5; }
.mini-btn.delete { background: #fff1f2; color: #e11d48; }
</style>
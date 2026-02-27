<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>PANTAU <span>TRANSAKSI</span></ion-title>
      </ion-toolbar>

      <div class="filter-glass-container">
        <div class="search-wrapper">
          <ion-icon :icon="searchOutline" class="search-icon"></ion-icon>
          <input 
            type="text" 
            placeholder="Cari Nama atau Meja..." 
            @input="handleSearch($event)"
            class="modern-input"
          />
        </div>
        
        <div class="segment-modern">
          <button 
            v-for="opt in ['aktif', 'selesai', 'semua']" 
            :key="opt"
            :class="{ active: statusFilter === opt }"
            @click="statusFilter = opt; loadTransactions()"
          >
            {{ opt.charAt(0).toUpperCase() + opt.slice(1) }}
          </button>
        </div>
      </div>
    </ion-header>

    <ion-content class="gray-bg">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="content-padding">
        <div v-if="transactions.length > 0" class="tx-list">
          <div v-for="tx in transactions" :key="tx.id" class="tx-card-modern" @click="viewDetail(tx.id)">
            <div class="tx-side-indicator" :class="tx.status_pembayaran.toLowerCase().replace(' ', '-')"></div>
            
            <div class="tx-main-content">
              <div class="tx-upper">
                <span class="tx-id-badge">#TRX-{{ tx.id }}</span>
                <span class="tx-time">{{ formatDate(tx.tanggal) }}</span>
              </div>

              <div class="tx-middle">
                <h3 class="tx-customer">{{ tx.nama_konsumen }}</h3>
                <div class="tx-tags">
                  <span class="tag-outline"><ion-icon :icon="restaurantOutline"></ion-icon> Meja {{ tx.meja }}</span>
                  <span class="tag-status" :class="tx.status_pembayaran.toLowerCase().replace(' ', '-')">
                    {{ tx.status_pembayaran }}
                  </span>
                </div>
              </div>

              <div class="tx-lower">
                <span class="tx-kasir">Oleh: {{ tx.kasir }}</span>
                <span class="tx-price">Rp {{ formatNumber(tx.total_bayar) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state-modern">
          <div class="icon-circle-bg">
            <ion-icon :icon="receiptOutline"></ion-icon>
          </div>
          <h4>Belum Ada Data</h4>
          <p>Transaksi yang Anda cari tidak ditemukan atau memang belum ada pesanan masuk.</p>
        </div>
      </div>

      <ion-modal :is-open="isModalOpen" @didDismiss="isModalOpen = false" class="modern-detail-modal">
        <div class="modal-wrapper" v-if="selectedTx">
          <div class="modal-drag-handle"></div>
          
          <div class="receipt-header">
            <div class="receipt-icon"><ion-icon :icon="receiptOutline"></ion-icon></div>
            <h3>Rincian Pesanan</h3>
            <p>ID Transaksi: #{{ selectedTx.id }}</p>
          </div>

          <div class="receipt-grid">
            <div class="grid-item">
              <label>Metode</label>
              <span>{{ selectedTx.metode_pembayaran || 'Pending' }}</span>
            </div>
            <div class="grid-item text-right">
              <label>Status</label>
              <span :class="selectedTx.status_pembayaran.toLowerCase().replace(' ', '-')">
                {{ selectedTx.status_pembayaran }}
              </span>
            </div>
          </div>

          <div class="receipt-items">
            <div v-for="item in selectedTx.pesanan" :key="item.id" class="receipt-item-row">
              <div class="item-left">
                <span class="item-qty">{{ item.jumlah }}x</span>
                <span class="item-name">{{ item.nama_menu }}</span>
              </div>
              <span class="item-subtotal">Rp {{ formatNumber(item.subtotal) }}</span>
            </div>
          </div>

          <div class="receipt-total">
            <div class="total-row">
              <span>Total Pembayaran</span>
              <span class="total-amount">Rp {{ formatNumber(selectedTx.total_bayar) }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-void-modern" @click="handleVoid(selectedTx.id)">
              <ion-icon :icon="trashOutline"></ion-icon> Void Transaction
            </button>
            <button class="btn-close-modern" @click="isModalOpen = false">Tutup</button>
          </div>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonIcon, IonModal,
  IonRefresher, IonRefresherContent, alertController, toastController
} from '@ionic/vue';
// PERBAIKAN: Tambahkan icon yang hilang
import { 
  receiptOutline, personOutline, restaurantOutline, calendarOutline, 
  trashOutline, closeCircleOutline,searchOutline
} from 'ionicons/icons';
import api from '@/services/api';

const transactions = ref<any[]>([]);
const selectedTx = ref<any>(null);
const isModalOpen = ref(false);
const statusFilter = ref('aktif');
const searchQuery = ref('');

const loadTransactions = async () => {
  try {
    const params: any = {};
    // Sesuaikan dengan logika index di Laravel Controller-mu
    if (statusFilter.value !== 'semua') params.status = statusFilter.value;
    if (searchQuery.value) params.keyword = searchQuery.value;

    const res = await api.get('/transaksis', { params });
    transactions.value = res.data.data;
  } catch (error) {
    console.error("Gagal load transaksi", error);
  }
};

const handleSearch = (ev: any) => {
  searchQuery.value = ev.target.value;
  loadTransactions();
};

const viewDetail = async (id: number) => {
  try {
    const res = await api.get(`/transaksis/${id}`);
    selectedTx.value = res.data.data;
    isModalOpen.value = true;
  } catch (error) {
    const toast = await toastController.create({
      message: 'Gagal memuat detail transaksi',
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }
};

const handleVoid = async (id: number) => {
  const alert = await alertController.create({
    header: 'Konfirmasi Void',
    mode: 'ios',
    message: 'Membatalkan transaksi akan menghapus data permanen. Lanjutkan?',
    buttons: [
      { text: 'Batal', role: 'cancel' },
      { 
        text: 'Ya, Void', 
        role: 'destructive',
        handler: async () => {
          try {
            // PASTIKAN: Di Laravel, route destroy sudah diaktifkan
            await api.delete(`/transaksis/${id}`); 
            isModalOpen.value = false;
            await loadTransactions();
            
            const toast = await toastController.create({
              message: 'Transaksi berhasil dihapus!',
              duration: 2000,
              color: 'success',
              icon: trashOutline
            });
            toast.present();
          } catch (e: any) {
            const errorMsg = e.response?.data?.message || 'Gagal menghapus. Cek API Laravel-mu.';
            const errToast = await toastController.create({
              message: errorMsg,
              duration: 3000,
              color: 'danger'
            });
            errToast.present();
          }
        }
      }
    ]
  });
  await alert.present();
};

const doRefresh = (event: any) => {
  loadTransactions().finally(() => event.target.complete());
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num || 0);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
};

onMounted(loadTransactions);
</script>

<style scoped>
/* --- BASE THEME --- */
.gray-bg { --background: #F8FAFC; }
.content-padding { padding: 16px; }

/* --- TOOLBAR & FILTER --- */
.main-toolbar { --background: #ffffff; --border-style: none; padding-top: 5px; }
ion-title { font-weight: 800; font-size: 13px; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; }
ion-title span { color: #1e293b; }

.filter-glass-container {
  background: white;
  padding: 10px 20px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.search-wrapper {
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  margin-bottom: 15px;
}
.search-icon { color: #94a3b8; font-size: 20px; }
.modern-input {
  border: none;
  background: transparent;
  padding: 12px;
  width: 100%;
  font-weight: 600;
  color: #1e293b;
  outline: none;
}

.segment-modern {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
}
.segment-modern button {
  flex: 1;
  border: none;
  padding: 8px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  background: transparent;
  transition: 0.2s;
}
.segment-modern button.active {
  background: white;
  color: #6366f1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* --- TRANSACTION CARDS --- */
.tx-list { display: flex; flex-direction: column; gap: 12px; }

.tx-card-modern {
  background: white;
  border-radius: 18px;
  display: flex;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: 0.2s;
}
.tx-card-modern:active { transform: scale(0.98); }

.tx-side-indicator { width: 6px; }
.tx-side-indicator.lunas { background: #10b981; }
.tx-side-indicator.belum-bayar { background: #f43f5e; }

.tx-main-content { padding: 16px; flex: 1; }

.tx-upper { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tx-id-badge { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 0.5px; }
.tx-time { font-size: 11px; font-weight: 600; color: #64748b; }

.tx-customer { font-size: 16px; font-weight: 800; color: #1e293b; margin: 0 0 10px 0; }

.tx-tags { display: flex; gap: 8px; align-items: center; }
.tag-outline {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 8px; border: 1px solid #e2e8f0; border-radius: 6px;
  font-size: 11px; font-weight: 700; color: #64748b;
}

.tag-status {
  font-size: 10px; font-weight: 800; text-transform: uppercase;
  padding: 4px 8px; border-radius: 6px;
}
.tag-status.lunas { background: #ecfdf5; color: #059669; }
.tag-status.belum-bayar { background: #fff1f2; color: #e11d48; }

.tx-lower {
  margin-top: 15px; padding-top: 12px; border-top: 1px solid #f8fafc;
  display: flex; justify-content: space-between; align-items: center;
}
.tx-kasir { font-size: 11px; color: #94a3b8; font-weight: 600; }
.tx-price { font-size: 17px; font-weight: 900; color: #1e293b; }

/* --- MODAL DETAIL --- */
.modern-detail-modal { --height: auto; --border-radius: 28px 28px 0 0; }
.modal-wrapper { padding: 24px; background: white; }
.modal-drag-handle { width: 40px; height: 5px; background: #e2e8f0; border-radius: 10px; margin: 0 auto 20px; }

.receipt-header { text-align: center; margin-bottom: 24px; }
.receipt-icon { 
  width: 50px; height: 50px; background: #eef2ff; color: #6366f1;
  border-radius: 15px; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px; font-size: 24px;
}
.receipt-header h3 { margin: 0; font-weight: 900; color: #1e293b; }
.receipt-header p { font-size: 12px; color: #94a3b8; margin: 4px 0 0; }

.receipt-grid { display: flex; justify-content: space-between; margin-bottom: 20px; }
.grid-item label { display: block; font-size: 10px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; }
.grid-item span { font-weight: 700; color: #334155; }
.grid-item .lunas { color: #10b981; }

.receipt-items { background: #f8fafc; border-radius: 16px; padding: 16px; margin-bottom: 20px; }
.receipt-item-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
.item-qty { font-weight: 800; color: #6366f1; margin-right: 10px; }
.item-name { font-weight: 700; color: #475569; }
.item-subtotal { font-weight: 800; color: #1e293b; }

.receipt-total { border-top: 2px dashed #e2e8f0; padding-top: 15px; }
.total-row { display: flex; justify-content: space-between; align-items: center; }
.total-row span { font-weight: 800; color: #64748b; }
.total-amount { font-size: 22px !important; color: #1e293b !important; }

.modal-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 25px; }
.btn-void-modern {
  background: #fff1f2; color: #e11d48; border: none; padding: 15px;
  border-radius: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-close-modern {
  background: #f1f5f9; color: #475569; border: none; padding: 15px; border-radius: 14px; font-weight: 700;
}

/* --- EMPTY STATE --- */
.empty-state-modern { text-align: center; padding: 60px 20px; }
.icon-circle-bg {
  width: 80px; height: 80px; background: white; color: #cbd5e1;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px; font-size: 40px; border: 1px solid #f1f5f9;
}
.empty-state-modern h4 { font-weight: 800; color: #64748b; margin-bottom: 8px; }
.empty-state-modern p { font-size: 13px; color: #94a3b8; line-height: 1.6; }
</style>
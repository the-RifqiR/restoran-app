<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>ANALYTICS <span>CENTRAL</span></ion-title>
        <ion-buttons slot="end">
          <div class="date-chip">
            {{ todayDate }}
          </div>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" style="--background: #F8FAFC;">
      <div class="hero-section">
        <div class="hero-text">
          <h1>Halo, Manager!</h1>
          <p>Pantau performa resto Anda secara real-time.</p>
        </div>
        <div class="hero-icon">
          <ion-icon :icon="analyticsOutline"></ion-icon>
        </div>
      </div>

      <ion-grid class="dashboard-grid">
        <ion-row>
          <ion-col size="12" size-lg="7">
            <div class="premium-card">
              <div class="card-top">
                <div class="title-group">
                  <ion-icon :icon="receiptOutline" class="header-icon icon-indigo"></ion-icon>
                  <h2>Recent Transactions</h2>
                </div>
                <span class="count-tag">10 Terbaru</span>
              </div>

              <div class="table-container">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Table</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tr in transactions" :key="tr.id">
                      <td>
                        <div class="customer-info">
                          <div class="status-indicator" :class="tr.status_pembayaran === 'Lunas' ? 'is-paid' : 'is-pending'"></div>
                          <strong>{{ tr.nama_konsumen }}</strong>
                        </div>
                      </td>
                      <td><span class="table-pill">#{{ tr.meja }}</span></td>
                      <td class="amount-cell">Rp {{ tr.total_bayar.toLocaleString() }}</td>
                      <td>
                        <span :class="['status-chip', tr.status_pembayaran === 'Lunas' ? 'chip-success' : 'chip-warning']">
                          {{ tr.status_pembayaran }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ion-col>

          <ion-col size="12" size-lg="5">
            <div class="premium-card">
              <div class="card-top">
                <div class="title-group">
                  <ion-icon :icon="fileTrayFullOutline" class="header-icon icon-emerald"></ion-icon>
                  <h2>Stock Activity</h2>
                </div>
              </div>

              <div class="log-list">
                <div v-for="stok in stockLogs" :key="stok.id" class="log-item">
                  <div class="log-left">
                    <div class="log-icon-box">
                      <ion-icon :icon="cubeOutline"></ion-icon>
                    </div>
                    <div class="log-details">
                      <p class="menu-name">{{ stok.nama_menu }}</p>
                      <span class="log-type">{{ stok.jenis_update }}</span>
                    </div>
                  </div>
                  <div class="log-right">
                    <span class="add-count">+{{ stok.jumlah_ditambahkan }}</span>
                    <span class="time">{{ formatTime(stok.waktu_update) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonIcon,
  IonButtons, IonMenuButton
} from '@ionic/vue';
import { analyticsOutline, receiptOutline, fileTrayFullOutline, cubeOutline} from 'ionicons/icons';
import api from '@/services/api';

const transactions = ref<any[]>([]);
const stockLogs = ref<any[]>([]);

const fetchData = async () => {
  try {
    // Ambil Transaksi (API index sudah pakai latest() di backend)
    const resTr = await api.get('/transaksis');
    transactions.value = resTr.data.data.slice(0, 10);

    // Ambil History Stok
    const resStok = await api.get('/laporan-stok');
    stockLogs.value = resStok.data.data.slice(0, 10);
  } catch (error) {
    console.error("Gagal mengambil data dashboard", error);
  }
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchData();
});

const todayDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
});
</script>

<style scoped>
/* 1. Typography & General */
.main-toolbar { --background: #ffffff; padding-top: 10px; }
ion-title { font-weight: 900; font-size: 11px; color: #94a3b8; letter-spacing: 2px; }
ion-title span { color: #1e293b; }

.date-chip {
  background: #f1f5f9;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  margin-right: 10px;
}

/* 2. Hero Section */
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 10px 30px;
}
.hero-text h1 { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; }
.hero-text p { color: #64748b; margin: 5px 0 0; font-size: 14px; }
.hero-icon { font-size: 40px; color: #6366f1; opacity: 0.2; }

/* 3. Premium Card Design */
.premium-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  height: 100%;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.title-group { display: flex; align-items: center; gap: 12px; }
.title-group h2 { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; }
.header-icon { font-size: 22px; }
.icon-indigo { color: #6366f1; }
.icon-emerald { color: #10b981; }

.count-tag {
  background: #eef2ff;
  color: #6366f1;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  text-transform: uppercase;
}

/* 4. Modern Table */
.table-container { overflow-x: auto; }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th {
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 1px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
}
.modern-table td { padding: 18px 0; border-bottom: 1px solid #f8fafc; }

.customer-info { display: flex; align-items: center; gap: 10px; }
.status-indicator { width: 4px; height: 16px; border-radius: 10px; }
.is-paid { background: #10b981; }
.is-pending { background: #f59e0b; }

.table-pill {
  background: #f8fafc;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 700;
  color: #475569;
}

.amount-cell { font-weight: 800; color: #0f172a; }

.status-chip {
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 800;
}
.chip-success { background: #ecfdf5; color: #10b981; }
.chip-warning { background: #fffbeb; color: #b45309; }

/* 5. Inventory Logs */
.log-list { display: flex; flex-direction: column; gap: 16px; }
.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 16px;
  transition: 0.3s;
}
.log-item:hover { background: #f8fafc; }
.log-left { display: flex; align-items: center; gap: 14px; }
.log-icon-box {
  width: 40px; height: 40px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
}
.menu-name { margin: 0; font-size: 14px; font-weight: 700; color: #0f172a; }
.log-type { font-size: 11px; color: #94a3b8; text-transform: capitalize; }
.log-right { text-align: right; }
.add-count { display: block; font-weight: 800; color: #10b981; font-size: 15px; }
.time { font-size: 10px; color: #cbd5e1; }
</style>
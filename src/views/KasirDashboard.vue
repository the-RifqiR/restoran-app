<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button class="menu-btn"></ion-menu-button>
        </ion-buttons>
        <ion-title>DASHBOARD</ion-title>
        <div slot="end" class="header-status">
          <div class="status-dot"></div>
          <span>Live Mode</span>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="dashboard-content">
      <div class="header-section">
        <h2 class="title-text">Transaksi <span>Terkini</span></h2>
        <p class="subtitle-text">Pantau arus pesanan yang masuk secara real-time.</p>
      </div>

      <div class="table-card">
        <div class="table-header">
          <ion-icon :icon="listOutline" class="header-icon"></ion-icon>
          <h3>Log Pesanan Terakhir</h3>
        </div>
        
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>KONSUMEN</th>
                <th>MEJA</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trx in transaksis.slice(0, 5)" :key="trx.id" @click="lihatDetail(trx.id)">
                <td class="id-cell">#{{ trx.id }}</td>
                <td class="name-cell">
                  <div class="avatar-mini">{{ trx.nama_konsumen.charAt(0) }}</div>
                  <strong>{{ trx.nama_konsumen }}</strong>
                </td>
                <td><span class="meja-tag">Meja {{ trx.meja }}</span></td>
                <td>
                  <span :class="['status-pill', trx.total_bayar > 0 ? 'is-lunas' : 'is-pending']">
                    {{ trx.status_pembayaran }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button class="view-all-btn" @click="router.push('/transaksi')">
          Lihat Semua Transaksi 
          <ion-icon :icon="arrowForwardOutline"></ion-icon>
        </button>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button class="main-fab" @click="router.push('/meja')">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>



<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton, IonIcon, IonFab, IonFabButton, IonButton 
} from '@ionic/vue';

import { useRouter } from 'vue-router';
import { listOutline, arrowForwardOutline, addOutline } from 'ionicons/icons';
import api from '@/services/api';

const router = useRouter();
const transaksis = ref([]);
let intervalId: any = null; // 2. Siapkan variabel penampung interval
const lihatDetail = (id: number) => router.push(`/transaksi/detail/${id}`);

const loadData = async () => {
  try {
    const response = await api.get(`/transaksis`);
    transaksis.value = response.data.data;
    console.log("Data dashboard diperbarui otomatis");
  } catch (error) {
    console.error("Gagal polling data:", error);
  }
};

onMounted(() => {
  loadData(); // Ambil data langsung saat pertama buka

  // Mulai polling setiap 5 detik (5000ms)
  intervalId = setInterval(() => {
    loadData();
  }, 5000);
});

onUnmounted(() => {
  // 4. Bersihkan interval agar tidak "bocor" ke halaman lain
  if (intervalId) {
    clearInterval(intervalId);
    console.log("Polling dashboard dihentikan");
  }
});
</script>

<style scoped>
/* Toolbar Styling */
.custom-toolbar {
  --background: #ffffff;
  --border-color: #f1f5f9;
  --padding-start: 16px;
  --padding-end: 16px;
}

ion-title {
  color: #0f172a;
  font-weight: 850;
  letter-spacing: 1px;
  font-size: 16px;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-right: 10px;
}

ion-fab {
  margin-bottom: 10px;
  margin-right: 10px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
}

/* Header Text */
.header-section { margin-bottom: 25px; margin-top: 10px; }
.title-text { color: #0f172a; font-size: 26px; font-weight: 800; margin: 0; }
.title-text span { color: #10b981; }
.subtitle-text { color: #64748b; font-size: 14px; margin-top: 4px; }

/* Table Card Design */
.table-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.table-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.table-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #334155;
}

.header-icon {
  color: #10b981;
  font-size: 20px;
}

/* Premium Table */
.table-responsive {   overflow-x: auto;
  -webkit-overflow-scrolling: touch;}
.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th {
  padding: 15px 20px;
  text-align: left;
  background: #f8fafc;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.premium-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.premium-table tr:last-child td { border-bottom: none; }
.premium-table tr:active { background: #f1f5f9; }

.id-cell { font-family: 'Courier New', monospace; font-weight: 700; color: #94a3b8; }

.name-cell { display: flex; align-items: center; gap: 10px; }
.avatar-mini {
  width: 28px;
  height: 28px;
  background: #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
}

.meja-tag {
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

/* Status Pills */
.status-pill {
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.is-lunas { background: #dcfce7; color: #15803d; }
.is-pending { background: #fee2e2; color: #b91c1c; }

/* Action Button */
.view-all-btn {
  width: 100%;
  padding: 18px;
  background: transparent;
  border: none;
  border-top: 1px solid #f1f5f9;
  color: #6366f1; /* Indigo accent */
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s;
}

.view-all-btn:active { background: #f8fafc; }

/* FAB Styling */
.main-fab {
  --background: #0f172a;
  --box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}
.dashboard-content {
   --background: #F8FAFC;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

/* ================= MOBILE OPTIMIZATION ================= */

@media (max-width: 576px) {
  .dashboard-content {
    padding: 14px;
  }

   ion-title {
    font-size: 14px;
  }

  .header-status {
    font-size: 9px;
    padding: 4px 8px;
  }

  .status-dot {
    width: 5px;
    height: 5px;
  }

    ion-fab {
    margin-bottom: 16px;
    margin-right: 16px;
  }

  .title-text {
    font-size: 20px;
  }

  .premium-table th:nth-child(3),
.premium-table td:nth-child(3) {
  display: none;
}

  .subtitle-text {
    font-size: 12px;
  }

  .table-header {
    padding: 16px;
  }

  .premium-table th,
  .premium-table td {
    padding: 12px 14px;
    font-size: 12px;
  }

  .avatar-mini {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }

    .premium-table th:last-child,
  .premium-table td:last-child {
    text-align: right;
  }

  .meja-tag {
    font-size: 11px;
    padding: 3px 8px;
  }

  .status-pill {
    font-size: 10px;
    padding: 5px 8px;
  }

  .view-all-btn {
    padding: 16px;
    font-size: 12px;
  }

}
</style>
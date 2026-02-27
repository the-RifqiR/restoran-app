<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>BILLING <span>DASHBOARD</span></ion-title>
      </ion-toolbar>

      <div class="header-control-panel">
        <div class="search-box-wrapper">
          <ion-searchbar 
            placeholder="Cari transaksi..." 
            v-model="filters.keyword"
            @ionInput="loadTransaksis" 
            class="premium-search"
            mode="ios">
          </ion-searchbar>
        </div>
        
        <div class="view-switcher-pill">
          <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
            <ion-icon :icon="gridOutline"></ion-icon>
          </button>
          <button :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">
            <ion-icon :icon="listOutline"></ion-icon>
          </button>
        </div>
      </div>

      <div class="filter-container">
        <div class="filter-scroll">
          <div :class="['p-pill', filters.status === 'aktif' ? 'is-active p-amber' : '']" @click="setStatus('aktif')">
            Pending
          </div>
          <div :class="['p-pill', filters.status === 'selesai' ? 'is-active p-emerald' : '']" @click="setStatus('selesai')">
            Lunas
          </div>
          <div :class="['p-pill', filters.status === '' ? 'is-active p-slate' : '']" @click="setStatus('')">
            Semua Riwayat
          </div>
        </div>
      </div>
    </ion-header>

   <ion-content class="billing-content">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div v-if="transaksis.length > 0">
        
        <div v-if="viewMode === 'grid'" class="cards-grid">
          <div v-for="trx in transaksis" :key="trx.id" class="premium-trx-card" @click="lihatDetail(trx.id)">
            <div :class="['status-strip', trx.total_bayar > 0 ? 'bg-emerald' : 'bg-amber']"></div>
            <div class="card-inner">
              <div class="card-top-row">
                <span class="trx-number">#TRX-{{ trx.id }}</span>
                <span :class="['status-dot-label', trx.total_bayar > 0 ? 's-emerald' : 's-amber']">
                  {{ trx.status_pembayaran }}
                </span>
              </div>
              <div class="card-main-info">
                <h3>{{ trx.nama_konsumen }}</h3>
                <div class="info-row">
                  <div class="info-item"><ion-icon :icon="restaurantOutline"></ion-icon> Meja {{ trx.meja }}</div>
                  <div class="info-item"><ion-icon :icon="timeOutline"></ion-icon> {{ formatDateOnlyTime(trx.tanggal) }}</div>
                </div>
              </div>
              <div class="card-footer-action">
                <div class="bill-amount">
                  <span class="label">TOTAL BILL</span>
                  <span class="value">Rp {{ formatNumber(trx.total_bayar || 0) }}</span>
                </div>
                <div class="action-trigger">
                  <ion-icon :icon="chevronForwardCircleOutline"></ion-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="table-container-premium">
          <table class="p-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>KONSUMEN</th>
                <th>STATUS</th>
                <th class="ion-text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trx in transaksis" :key="trx.id" @click="lihatDetail(trx.id)">
                <td class="p-col-id">{{ trx.id }}</td>
                <td>
                  <div class="p-col-name">
                    <strong>{{ trx.nama_konsumen }}</strong>
                    <small>Meja {{ trx.meja }}</small>
                  </div>
                </td>
                <td>
                  <span :class="['p-status-mini', trx.total_bayar > 0 ? 'is-emerald' : 'is-amber']"></span>
                </td>
                <td class="ion-text-right p-col-price">
                  Rp {{ formatNumber(trx.total_bayar || 0) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button class="main-fab" @click="bukaTransaksiBaru">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonSearchbar, IonIcon, IonButton, IonFab,
    IonFabButton, IonRefresher, IonRefresherContent, modalController
} from '@ionic/vue';
import {
    restaurantOutline, timeOutline, chevronForwardOutline,
    addOutline, receiptOutline, gridOutline, listOutline, // Tambahkan 2 ini
    chevronForwardCircleOutline // Tambahkan ini juga karena dipakai di Grid
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const transaksis = ref<any[]>([]);
const filters = reactive({
    keyword: '',
    status: 'aktif' // Default tampilkan yang aktif (Belum bayar)
});
const viewMode = ref('grid');

const loadTransaksis = async () => {
    try {
        const params = {
            keyword: filters.keyword,
            status: filters.status
        };
        const response = await api.get('/transaksis', { params });
        transaksis.value = response.data.data;
    } catch (error) {
        console.error("Gagal memuat transaksi", error);
    }
};

const setStatus = (status: string) => {
    filters.status = status;
    loadTransaksis();
};

const doRefresh = async (event: any) => {
    await loadTransaksis();
    event.target.complete();
};

const lihatDetail = (id: number) => {
    router.push(`/transaksi/detail/${id}`);
};

const bukaTransaksiBaru = () => {
    router.push('/meja'); // Biasanya mulai dari pilih meja
};

// Helpers
const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);
const formatDateOnlyTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

onMounted(loadTransaksis);
</script>



<style scoped>
/* Toolbar & Base Typography */
.main-toolbar { --background: #ffffff; --padding-top: 8px; }
ion-title { color: #94a3b8; font-weight: 850; font-size: 13px; letter-spacing: 1.5px; }
ion-title span { color: #0f172a; }

/* Control Panel (Search & View Switcher) */
.header-control-panel {
  background: white;
  padding: 0 16px 10px;
  display: flex;
  gap: 12px;
  align-items: center;
}
.search-box-wrapper { flex: 1; }
.premium-search { --background: #f1f5f9; --border-radius: 14px; --padding-top: 0; --padding-bottom: 0; }

.view-switcher-pill {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  height: 44px;
}
.view-switcher-pill button {
  border: none;
  background: transparent;
  width: 40px;
  border-radius: 8px;
  color: #94a3b8;
  transition: 0.3s;
}
.view-switcher-pill button.active {
  background: #0f172a;
  color: #10b981;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

/* Filter Pills V2 */
.filter-container { background: white; padding-bottom: 15px; }
.filter-scroll { display: flex; gap: 8px; padding: 0 16px; overflow-x: auto; scrollbar-width: none; }
.p-pill {
  padding: 8px 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
}
.p-pill.is-active { border-color: transparent; color: white; }
.p-amber.is-active { background: #f59e0b; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }
.p-emerald.is-active { background: #10b981; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
.p-slate.is-active { background: #0f172a; }

/* Table Premium V2 */
.table-container-premium {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
.p-table { width: 100%; border-collapse: collapse; }
.p-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 1px;
}
.p-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
.p-col-id { font-family: monospace; font-weight: 700; color: #cbd5e1; }
.p-col-name { display: flex; flex-direction: column; }
.p-col-name strong { color: #0f172a; }
.p-col-name small { color: #94a3b8; font-size: 11px; }
.p-status-mini { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.is-emerald { background: #10b981; box-shadow: 0 0 6px #10b981; }
.is-amber { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.p-col-price { font-weight: 800; color: #0f172a; }

/* Grid Cards V2 */
.premium-trx-card {
  background: #ffffff;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}
.status-strip { position: absolute; top: 0; left: 0; bottom: 0; width: 6px; }
.bg-emerald { background: #10b981; }
.bg-amber { background: #f59e0b; }

.card-inner { padding: 18px 18px 18px 24px; }
.card-top-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
.trx-number { font-size: 11px; font-weight: 800; color: #cbd5e1; }
.status-dot-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.s-emerald { color: #10b981; }
.s-amber { color: #f59e0b; }

.card-main-info h3 { margin: 0; font-size: 18px; font-weight: 850; color: #0f172a; }
.info-row { display: flex; gap: 12px; margin-top: 6px; }
.info-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #64748b; font-weight: 600; }

.card-footer-action {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bill-amount .label { font-size: 9px; font-weight: 800; color: #94a3b8; display: block; }
.bill-amount .value { font-size: 19px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
.action-trigger {font-size: 28px; 
    color: #10b981; /* Gunakan warna emerald agar senada */
    opacity: 0.8;   /* Tingkatkan opacity agar terlihat */}

.main-fab { --background: #0f172a; --color: #10b981; }

.billing-content {
  --background: #F8FAFC;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Tablet */
@media (min-width: 640px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop */
@media (min-width: 1400px) {
  .cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {

  .table-container-premium {
    overflow-x: auto;
  }

  .p-table {
    min-width: 600px;
  }

}

/* HP kecil */
@media (max-width: 576px) {
  .billing-content {
    padding: 14px;
  }
    ion-title {
    font-size: 12px;
  }

  .p-pill {
    font-size: 11px;
    padding: 6px 12px;
  }

  
    .header-control-panel {
    flex-direction: column;
    gap: 10px;
  }

  .view-switcher-pill {
    width: 100%;
    justify-content: center;
  }
    .card-inner {
    padding: 16px 16px 16px 22px;
  }

  .card-main-info h3 {
    font-size: 16px;
  }

  .bill-amount .value {
    font-size: 17px;
  }

  .action-trigger {
    font-size: 24px;
  }
}
</style>
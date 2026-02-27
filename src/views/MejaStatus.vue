<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="dark"></ion-menu-button>
        </ion-buttons>
        <ion-title>STATUS MEJA</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="loadMejas">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

<ion-content class="meja-content">
      <div class="header-flex">
        <div class="header-info">
          <h2 class="title-text">Denah <span>Restoran</span></h2>
          <p class="subtitle-text">Monitoring meja secara real-time.</p>
        </div>
      </div>

      <ion-grid class="ion-no-padding">
        <ion-row>
          <ion-col size="12" size-md="6" v-for="meja in mejas" :key="meja.id">
            <div :class="['meja-card-premium', meja.status === 'terisi' ? 'status-terisi' : 'status-kosong']">

              <div class="card-top">
                <div class="meja-icon-box">
                  <ion-icon :icon="restaurantOutline"></ion-icon>
                </div>
                <div class="status-badge-pill">{{ meja.status }}</div>
              </div>

              <div class="card-mid">
                <span class="label">Nomor Meja</span>
                <h1 class="meja-number">{{ meja.no_meja }}</h1>
              </div>

              <div class="card-bottom">
                <div v-if="meja.status === 'terisi'">
                  <p class="trx-id">Pesanan No: <span>#{{ meja.id_transaksi_aktif }}</span></p>
                  <ion-button expand="block" class="btn-detail" @click="lihatDetail(meja.id_transaksi_aktif)">
                    Detail Billing
                  </ion-button>
                </div>

                <ion-button v-else expand="block" class="btn-open" @click="bukaModalTransaksi(meja)">
                  Buka Pesanan
                </ion-button>
              </div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>

    <ion-modal :is-open="isModalOpen" @didDismiss="isModalOpen = false" :initial-breakpoint="0.5"
      :breakpoints="[0, 0.5]">
      <div class="modal-container ion-padding">
        <h2 class="modal-title">Buka Pesanan Baru</h2>
        <p>Meja Nomor: <strong>{{ selectedMeja?.no_meja }}</strong></p>

        <ion-item lines="outline" class="custom-input">
          <ion-label position="stacked">Nama Konsumen</ion-label>
          <ion-input v-model="form.nama_konsumen" placeholder="Contoh: Budi Sudarsono"></ion-input>
        </ion-item>

        <ion-button expand="block" color="dark" :disabled="isLoading" @click="simpanTransaksi">
          <span v-if="!isLoading">Mulai Pesanan</span>
          <ion-spinner v-else name="crescent"></ion-spinner>
        </ion-button>
      </div>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonGrid, IonRow, IonCol, IonButton, IonIcon,
  IonModal, IonItem, IonLabel, IonInput, toastController
} from '@ionic/vue';
import { refreshOutline, peopleOutline, restaurantOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const mejas = ref([]);
const isModalOpen = ref(false);
const isLoading = ref(false);
const selectedMeja = ref<any>(null);

let intervalId: any = null;

onMounted(() => {
  loadMejas();
  // Jalankan polling setiap 5 detik
  intervalId = setInterval(() => {
    loadMejas();
  }, 5000);
});

onUnmounted(() => {
  // Penting! Hapus interval saat pindah halaman agar tidak membebani memori
  if (intervalId) clearInterval(intervalId);
});


const form = reactive({
  nama_konsumen: '',
  mejas_id: null as number | null
});

const loadMejas = async () => {
  try {
    const response = await api.get('/mejas');
    mejas.value = response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data meja", error);
  }
};

const bukaModalTransaksi = (meja: any) => {
  selectedMeja.value = meja;
  form.mejas_id = meja.id;
  form.nama_konsumen = '';
  isModalOpen.value = true;
};

const simpanTransaksi = async () => {
  if (!form.nama_konsumen) {
    const toast = await toastController.create({
      message: 'Nama konsumen wajib diisi!',
      duration: 2000,
      color: 'warning'
    });
    return toast.present();
  }

  isLoading.value = true;
  try {
    // Memanggil API Store Transaksi (Laravel)
    const response = await api.post('/transaksis', {
      nama_konsumen: form.nama_konsumen,
      mejas_id: form.mejas_id
    });

    isModalOpen.value = false;

    // Setelah berhasil, arahkan ke Detail Transaksi untuk tambah menu
    router.push(`/transaksi/detail/${response.data.data.id}`);

  } catch (error: any) {
    const msg = error.response?.data?.message || 'Gagal membuka transaksi';
    const toast = await toastController.create({ message: msg, duration: 3000, color: 'danger' });
    toast.present();
  } finally {
    isLoading.value = false;
  }
};

const lihatDetail = (trxId: number) => {
  router.push(`/transaksi/detail/${trxId}`);
};

onMounted(loadMejas);
</script>
<style scoped>
/* Toolbar & Header */
.custom-toolbar {
  --background: #ffffff;
  --border-color: #f1f5f9;
}

ion-title {
  font-weight: 850;
  letter-spacing: 1px;
  color: #0f172a;
  font-size: 16px;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 25px;
}

.title-text {
  color: #0f172a;
  font-size: 24px;
  font-weight: 850;
  margin: 0;
}

.title-text span {
  color: #10b981;
}

.subtitle-text {
  color: #64748b;
  font-size: 13px;
  margin: 4px 0 0;
}

.status-legend {
  display: flex;
  gap: 15px;
  background: #ffffff;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.legend-item {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.emerald {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.dot.slate {
  background: #0f172a;
}

/* Meja Card Premium */
.meja-card-premium {
  position: relative;
  background: #ffffff;
  border-radius: 28px;
  padding: 24px;
  margin: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* State: Terisi (Midnight Slate) */
.status-terisi {
  background: #0f172a;
  border-color: #1e293b;
  color: #ffffff;
}

.status-terisi .meja-number {
  color: #ffffff;
}

.status-terisi .label {
  color: #94a3b8;
}

.status-terisi .capacity {
  color: #64748b;
}

.status-terisi .status-badge-pill {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.status-terisi .meja-icon-box {
  background: rgba(255, 255, 255, 0.05);
  color: #334155;
}

/* State: Kosong (Emerald Accent) */
.status-kosong {
  border-bottom: 4px solid #10b981;
}

.status-kosong .meja-icon-box {
  background: #ecfdf5;
  color: #10b981;
}

.status-kosong .status-badge-pill {
  background: #dcfce7;
  color: #15803d;
}

.status-kosong .meja-number {
  color: #0f172a;
}

/* Elements Inside Card */
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.meja-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.status-badge-pill {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meja-number {
  font-size: 42px;
  font-weight: 900;
  margin: 0;
  line-height: 1;
}

.label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.capacity {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

/* Buttons */
.btn-open {
  --background: #10b981;
  --border-radius: 14px;
  --box-shadow: 0 8px 15px rgba(16, 185, 129, 0.2);
  margin-top: 20px;
  font-weight: 700;
}

.btn-detail {
  --background: #ffffff;
  --color: #0f172a;
  --border-radius: 14px;
  margin-top: 12px;
  font-weight: 700;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 15px 0;
}

.trx-id {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 5px;
}

.trx-id span {
  color: #ffffff;
  font-weight: 700;
}

/* Decor */
.card-decor {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, currentColor 0%, transparent 70%);
  opacity: 0.05;
}

.meja-content {
  --background: #F8FAFC;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

@media (max-width: 576px) {
  .meja-content {
    padding: 14px;
  }
  .meja-card-premium {
    padding: 18px;
    border-radius: 22px;
    margin: 6px 0;
  }

  .meja-number {
    font-size: 32px;
  }

  .meja-icon-box {
    width: 34px;
    height: 34px;
    font-size: 16px;
  }

  .status-badge-pill {
    font-size: 9px;
    padding: 4px 10px;
  }

  .btn-open,
  .btn-detail {
    margin-top: 16px;
    font-size: 13px;
  }
  ion-title {
    font-size: 14px;
  }

  .title-text {
    font-size: 20px;
  }

  .subtitle-text {
    font-size: 12px;
  }


}
</style>
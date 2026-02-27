<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/transaksi" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>INVOICE <span>#{{ route.params.id }}</span></ion-title>
        <ion-buttons slot="end">
          <ion-button color="primary">
            <ion-icon slot="icon-only" :icon="shareOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" v-if="transaksi" style="--background: #F8FAFC;">
      <div class="invoice-header-card">
        <div class="customer-info">
          <div class="avatar-large">{{ transaksi.nama_konsumen.charAt(0) }}</div>
          <div class="text-info">
            <h2>{{ transaksi.nama_konsumen }}</h2>
            <p><ion-icon :icon="locationOutline"></ion-icon> Meja {{ transaksi.meja }}</p>
          </div>
          <div :class="['status-indicator', transaksi.status_pembayaran === 'Lunas' ? 'is-lunas' : 'is-pending']">
            {{ transaksi.status_pembayaran }}
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Kasir</span>
            <span class="meta-value">{{ transaksi.kasir }}</span>
          </div>
          <div class="meta-item text-right">
            <span class="meta-label">Waktu</span>
            <span class="meta-value">14:30 WIB</span>
          </div>
        </div>
      </div>

      <div class="bill-card">
        <h3 class="bill-title">Rincian Konsumsi</h3>

        <div class="item-list">
          <div class="bill-item" v-for="item in transaksi.pesanan" :key="item.id">
            <div class="item-qty">{{ item.jumlah }}x</div>
            <div class="item-desc">
              <span class="item-name">{{ item.nama_menu }}
                <ion-badge color="light" style="font-size: 9px;">{{ item.tipe }}</ion-badge>
              </span>
              <span class="item-price">Rp {{ formatNumber(item.harga_satuan) }}</span>
              <ion-note v-if="item.catatan" color="medium" style="font-size: 11px; font-style: italic;">
                "{{ item.catatan }}"
              </ion-note>
            </div>
            <div class="item-subtotal">Rp {{ formatNumber(item.subtotal) }}</div>
          </div>
        </div>
        <div class="bill-divider"></div>

        <div class="summary-section">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>Rp {{ formatNumber(hitungTotal()) }}</span>
          </div>
          <div class="summary-row">
            <span>Pajak (10%)</span>
            <span>Rp {{ formatNumber(hitungTotal() * 0.1) }}</span>
          </div>
          <div class="summary-total">
            <div class="total-label">Total Pembayaran</div>
            <div class="total-value">Rp {{ formatNumber(hitungTotal() * 1.1) }}</div>
          </div>
        </div>
      </div>

      <div class="action-footer" v-if="transaksi.status_pembayaran !== 'Lunas'">
        <button class="btn-add-item" @click="bukaModalTambahMenu">
          <ion-icon :icon="fastFoodOutline"></ion-icon>
          Tambah Menu
        </button>
        <button class="btn-checkout-now" @click="prosesCheckout">
          LUNASI SEKARANG
        </button>
      </div>

      <ion-modal :is-open="isModalOpen" @didDismiss="isModalOpen = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Tambah Pesanan</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isModalOpen = false">Tutup</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="form-container">
            <ion-item fill="outline" mode="md" class="ion-margin-bottom">
              <ion-label position="stacked">Pilih Menu</ion-label>
              <ion-select v-model="formPesanan.menus_id" placeholder="Pilih makanan/minuman">
                <ion-select-option v-for="m in menus" :key="m.id" :value="m.id">
                  {{ m.nama_menu }} 
  (Rp {{ formatNumber(m.harga) }}) 
  — Stok: {{ m.stok > 0 ? m.stok : 'HABIS' }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item fill="outline" mode="md" class="ion-margin-bottom">
              <ion-label position="stacked">Jumlah</ion-label>
              <ion-input type="number" v-model="formPesanan.jumlah"></ion-input>
            </ion-item>

            <ion-item fill="outline" mode="md" class="ion-margin-bottom">
              <ion-label position="stacked">Tipe Pesanan</ion-label>
              <ion-select v-model="formPesanan.metode">
                <ion-select-option value="DI">Dine In (Makan Sini)</ion-select-option>
                <ion-select-option value="TA">Take Away (Bungkus)</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item fill="outline" mode="md" class="ion-margin-bottom">
              <ion-label position="stacked">Catatan (Opsional)</ion-label>
              <ion-textarea v-model="formPesanan.catatan"
                placeholder="Contoh: Gak pake seledri, Pedas banget"></ion-textarea>
            </ion-item>

            <ion-button expand="block" @click="simpanPesanan" class="ion-margin-top" color="dark">
              TAMBAHKAN KE BILL
            </ion-button>
          </div>
          
        </ion-content>
      </ion-modal>
      <ion-modal :is-open="isCheckoutModalOpen" @didDismiss="isCheckoutModalOpen = false" class="checkout-modal">
        <div class="modal-content ion-padding">
          <h3 class="modal-title-center">Pembayaran</h3>
          
          <div class="checkout-total-box">
            <span>Total Tagihan</span>
            <h2>Rp {{ formatNumber(hitungTotal() * 1.1) }}</h2>
          </div>

          <p class="section-label">Pilih Metode Pembayaran</p>
          <div class="payment-methods-grid">
            <div 
              :class="['method-card', selectedPaymentMethod === 'Tunai' ? 'active-method' : '']"
              @click="selectedPaymentMethod = 'Tunai'"
            >
              <ion-icon :icon="cashOutline"></ion-icon>
              <span>Tunai</span>
            </div>
            
            <div 
              :class="['method-card', selectedPaymentMethod === 'QRIS' ? 'active-method' : '']"
              @click="selectedPaymentMethod = 'QRIS'"
            >
              <ion-icon :icon="qrCodeOutline"></ion-icon>
              <span>QRIS</span>
            </div>

            <div 
              :class="['method-card', selectedPaymentMethod === 'Debit' ? 'active-method' : '']"
              @click="selectedPaymentMethod = 'Debit'"
            >
              <ion-icon :icon="cardOutline"></ion-icon>
              <span>Debit/Kredit</span>
            </div>
          </div>

          <div class="modal-actions ion-margin-top">
            <ion-button expand="block" color="dark" @click="submitCheckout" :disabled="isSubmittingCheckout">
              <span v-if="!isSubmittingCheckout">Konfirmasi Bayar</span>
              <span v-else>Memproses...</span>
            </ion-button>
            <ion-button expand="block" fill="clear" color="medium" @click="isCheckoutModalOpen = false">
              Batal
            </ion-button>
          </div>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonItem, IonLabel, IonBadge, IonButton, IonIcon, 
  IonModal, IonSelect, IonSelectOption, IonInput, IonTextarea, IonNote, // Pastikan semua ada di sini
  alertController, toastController, 
} from '@ionic/vue';
import { fastFoodOutline, locationOutline, shareOutline, timeOutline, cashOutline, qrCodeOutline, cardOutline} from 'ionicons/icons';

const route = useRoute();
const router = useRouter();
const transaksi = ref<any>(null);

const isModalOpen = ref(false);
const menus = ref<any[]>([]); // Untuk daftar pilihan menu
const formPesanan = ref({
  menus_id: '',
  jumlah: 1,
  metode: 'DI', // Default Dine In
  catatan: ''
});
const isCheckoutModalOpen = ref(false);
const selectedPaymentMethod = ref('Tunai'); // Default Tunai
const isSubmittingCheckout = ref(false);


const loadMenus = async () => {
  try {
    const res = await api.get('/menus');
    menus.value = res.data.data;
  } catch (err) {
    console.error("Gagal load menu", err);
  }
};

const bukaModalTambahMenu = () => {
  loadMenus();
  isModalOpen.value = true;
};

const simpanPesanan = async () => {
  const selectedMenu = menus.value.find(m => m.id === formPesanan.value.menus_id);
  
  if (selectedMenu && formPesanan.value.jumlah > selectedMenu.stok) {
    const toast = await toastController.create({
      message: `Jumlah melebihi stok tersedia (${selectedMenu.stok})`,
      duration: 3000,
      color: 'warning'
    });
    return toast.present();
  }
  try {
    await api.post(`/transaksis/${route.params.id}/pesan`, formPesanan.value);

    // Reset form & reload data
    isModalOpen.value = false;
    formPesanan.value = { menus_id: '', jumlah: 1, metode: 'DI', catatan: '' };
    await Promise.all([loadDetail(), loadMenus()]);

    const toast = await toastController.create({
      message: 'Pesanan berhasil ditambahkan!',
      duration: 2000,
      color: 'success'
    });
    toast.present();
  } catch (err: any) {
    const msg = err.response?.data?.message || 'Gagal menambah pesanan';
    const toast = await toastController.create({
      message: msg,
      duration: 3000,
      color: 'danger'
    });
    toast.present();
  }
};

const loadDetail = async () => {
  try {
    const res = await api.get(`/transaksis/${route.params.id}`);
    transaksi.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
};

const hitungTotal = () => {
  // 1. Cek apakah transaksi dan pesanan ada
  if (!transaksi.value || !transaksi.value.pesanan) return 0;

  return transaksi.value.pesanan.reduce((acc: number, item: any) => {
    // 2. Pastikan subtotal adalah angka, jika tidak ada/bukan angka gunakan 0
    const subtotal = Number(item.subtotal) || 0;
    return acc + subtotal;
  }, 0);
};

const prosesCheckout = () => {
  // Reset metode ke Tunai setiap kali modal dibuka
  selectedPaymentMethod.value = 'Tunai'; 
  isCheckoutModalOpen.value = true;
};

const submitCheckout = async () => {
  isSubmittingCheckout.value = true;
  try {
    await api.post(`/transaksis/${route.params.id}/checkout`, {
      metode_pembayaran: selectedPaymentMethod.value // Mengirim metode yang dipilih kasir
    });
    
    // Refresh data setelah sukses bayar
    await loadDetail();
    isCheckoutModalOpen.value = false;
    
    const toast = await toastController.create({
      message: `Transaksi Berhasil Dilunasi dengan ${selectedPaymentMethod.value}!`,
      duration: 2000,
      color: 'success'
    });
    toast.present();
    setTimeout(() => {
  router.replace('/transaksi'); // Kembali ke daftar transaksi
}, 2000);
  } catch (err: any) {
    const msg = err.response?.data?.message || 'Gagal memproses pembayaran';
    const toast = await toastController.create({
      message: msg,
      duration: 3000,
      color: 'danger'
    });
    toast.present();
    setTimeout(() => {
  router.replace('/transaksi'); // Kembali ke daftar transaksi
}, 2000);
  } finally {
    isSubmittingCheckout.value = false;
  }
};

const formatNumber = (num: number | string) => {
  const value = typeof num === 'string' ? parseFloat(num) : num;
  return new Intl.NumberFormat('id-ID').format(value || 0);
};

onMounted(loadDetail);
</script>

<style scoped>
/* Toolbar Design */
.custom-toolbar {
  --background: #ffffff;
  --border-color: #f1f5f9;
}

ion-title {
  font-weight: 850;
  font-size: 14px;
  color: #64748b;
  letter-spacing: 1px;
}

ion-title span {
  color: #0f172a;
}

/* Invoice Header Card */
.invoice-header-card {
  background: #0f172a;
  /* Slate 900 */
  border-radius: 24px;
  padding: 24px;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 15px 30px rgba(15, 23, 42, 0.2);
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  position: relative;
}

.avatar-large {
  width: 50px;
  height: 50px;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
}

.text-info h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.text-info p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-indicator {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.is-pending {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.is-lunas {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 15px;
}

.meta-label {
  display: block;
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
}

.meta-value {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.text-right {
  text-align: right;
}

/* Bill Card (Struk) */
.bill-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.bill-title {
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
}

.bill-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 18px;
  gap: 12px;
}

.item-qty {
  font-weight: 800;
  color: #10b981;
  font-size: 14px;
}

.item-desc {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 700;
  color: #334155;
  font-size: 15px;
}

.item-price {
  font-size: 12px;
  color: #94a3b8;
}

.item-subtotal {
  font-weight: 700;
  color: #0f172a;
  font-size: 14px;
}

.bill-divider {
  height: 2px;
  border-top: 2px dashed #e2e8f0;
  margin: 20px 0;
}

/* Summary Section */
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.summary-total {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
}

.total-label {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.total-value {
  font-size: 26px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -1px;
}

/* Action Footer */
.action-footer {
  position: sticky;
  bottom: 0;
  background: #F8FAFC;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

.btn-add-item {
  background: #f1f5f9;
  color: #475569;
  padding: 16px;
  border-radius: 16px;
  border: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.checkout-modal {
  --height: 480px;
  --border-radius: 28px;
  --align-items: center;
}

.modal-title-center {
  text-align: center;
  font-weight: 800;
  color: #0f172a;
  margin-top: 10px;
  margin-bottom: 20px;
}

.checkout-total-box {
  background: #f8fafc;
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 25px;
  border: 1px dashed #cbd5e1;
}

.checkout-total-box span {
  font-size: 13px;
  color: #64748b;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.checkout-total-box h2 {
  margin: 10px 0 0;
  font-size: 28px;
  font-weight: 900;
  color: #10b981;
}

.section-label {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 12px;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
}

.method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 10px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  gap: 8px;
  cursor: pointer;
  transition: 0.2s;
  color: #64748b;
}

.method-card ion-icon {
  font-size: 28px;
}

.method-card span {
  font-size: 11px;
  font-weight: 700;
}

.active-method {
  border-color: #0f172a;
  background: #0f172a;
  color: #10b981;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}
.btn-checkout-now {
  background: #0f172a;
  color: #10b981;
  padding: 18px;
  border-radius: 18px;
  border: none;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: 1px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
}

@media (max-width: 576px) {
  .bill-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;
  }

  .item-subtotal {
    align-self: flex-end;
    font-size: 15px;
  }

  .item-qty {
    font-size: 13px;
  }

    .invoice-header-card {
    padding: 18px;
    border-radius: 20px;
  }

  .customer-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .status-indicator {
    position: static;
    align-self: flex-start;
  }

  .text-info h2 {
    font-size: 18px;
  }
   .checkout-modal {
    --height: 85%;
    --border-radius: 24px 24px 0 0;
  }
}

@media (max-width: 480px) {
  .payment-methods-grid {
    grid-template-columns: repeat(2, 1fr);
  }
   .total-value {
    font-size: 22px;
  }

  .summary-row {
    font-size: 13px;
  }

  .item-name {
    font-size: 14px;
  }
}
</style>
<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="owner-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>OWNER <span>DASHBOARD</span></ion-title>
        <ion-buttons slot="end">
          <ion-button @click="loadData">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding gray-bg">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="section-title">Ringkasan Penjualan</div>
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon"><ion-icon :icon="walletOutline"></ion-icon></div>
          <div class="stat-val">Rp {{ formatNumber(totalRevenue) }}</div>
          <div class="stat-label">Total Omzet (Bulan Ini)</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon"><ion-icon :icon="cartOutline"></ion-icon></div>
          <div class="stat-val">{{ totalSold }}</div>
          <div class="stat-label">Porsi Terjual</div>
        </div>
      </div>

      <div class="section-header">
        <div class="section-title">Top 3 Menu Terlaris</div>
        <ion-badge color="success">Bulan Ini</ion-badge>
      </div>

      <div class="top-menu-list">
        <div v-for="(item, index) in topMenus" :key="index" class="top-item">
          <div class="rank">{{ index + 1 }}</div>
          <div class="item-info">
            <div class="item-name">{{ item.nama_menu }}</div>
            <div class="item-kategori">{{ item.kategori }}</div>
          </div>
          <div class="item-count">
            <strong>{{ item.terjual }}</strong> <small>porsi</small>
          </div>
        </div>
      </div>

      <div class="section-title mt-20">Detail Performa Seluruh Menu</div>
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Menu</th>
              <th>Terjual</th>
              <th>Pendapatan</th>
              <th>Stok</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="menu in performanceData" :key="menu.nama_menu">
              <td>
                <div class="td-name">{{ menu.nama_menu }}</div>
                <div class="td-sub">{{ menu.kategori }}</div>
              </td>
              <td>{{ menu.terjual }}</td>
              <td>Rp {{ formatNumber(menu.pendapatan) }}</td>
              <td>
                <ion-badge :color="menu.sisa_stok < 10 ? 'danger' : 'medium'">
                  {{ menu.sisa_stok }}
                </ion-badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="performanceData.length === 0" class="empty-state">
        <ion-icon :icon="analyticsOutline"></ion-icon>
        <p>Belum ada data penjualan bulan ini</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonMenuButton, IonIcon, IonRefresher, IonRefresherContent, IonBadge, IonButton
} from '@ionic/vue';
import { 
  walletOutline, cartOutline, refreshOutline, 
  analyticsOutline, trendingUpOutline 
} from 'ionicons/icons';
import api from '@/services/api';

const performanceData = ref<any[]>([]);
const totalRevenue = ref(0);
const totalSold = ref(0);

const loadData = async () => {
  try {
    const res = await api.get('/performance-menu');
    const data = res.data.data;
    performanceData.value = data;
    totalRevenue.value = data.reduce((sum: number, item: any) => sum + item.pendapatan, 0);
    totalSold.value = data.reduce((sum: number, item: any) => sum + item.terjual, 0);
  } catch (error) {
    console.error("Gagal load data owner", error);
  }
};

const topMenus = computed(() => {
  return [...performanceData.value]
    .sort((a, b) => b.terjual - a.terjual)
    .slice(0, 3);
});

const doRefresh = (event: any) => {
  loadData().finally(() => event.target.complete());
};

const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

onMounted(loadData);
</script>

<style scoped>
.gray-bg { --background: #F8FAFC; }
.owner-toolbar { --background: #ffffff; padding: 10px 5px; }
ion-title { font-weight: 800; font-size: 14px; color: #475569; letter-spacing: 1px; }
ion-title span { color: #10b981; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin: 20px 0 10px; }
.section-title { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; }
.stat-card { padding: 15px; border-radius: 20px; color: white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.stat-card.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.stat-card.green { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon { font-size: 24px; margin-bottom: 10px; opacity: 0.8; }
.stat-val { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
.stat-label { font-size: 10px; opacity: 0.9; font-weight: 600; }

.top-menu-list { background: white; border-radius: 20px; padding: 10px; margin-top: 10px; border: 1px solid #e2e8f0; }
.top-item { display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #f1f5f9; gap: 12px; }
.top-item:last-child { border-bottom: none; }
.rank { width: 30px; height: 30px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #475569; font-size: 12px; }
.item-info { flex: 1; }
.item-name { font-weight: 700; color: #1e293b; font-size: 14px; }
.item-kategori { font-size: 11px; color: #94a3b8; }
.item-count { text-align: right; color: #1e293b; }
.item-count strong { font-size: 16px; color: #10b981; }

.mt-20 { margin-top: 25px; }
.table-container { background: white; border-radius: 20px; overflow: hidden; margin-top: 10px; border: 1px solid #e2e8f0; }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; }
.custom-table td { padding: 12px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
.td-name { font-weight: 700; }
.td-sub { font-size: 10px; color: #94a3b8; }

.empty-state { text-align: center; padding: 40px; color: #94a3b8; }
.empty-state ion-icon { font-size: 48px; margin-bottom: 10px; }
</style>
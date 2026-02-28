<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="owner-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>MANAJEMEN <span>KARYAWAN</span></ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openAddModal" fill="solid" color="success" class="add-btn">
            <ion-icon slot="start" :icon="addOutline"></ion-icon>
            Tambah Karyawan
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding gray-bg">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-searchbar placeholder="Cari nama atau username..." v-model="searchQuery" class="custom-search"></ion-searchbar>

      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Info Karyawan</th>
              <th>Jabatan/Role</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="td-name">{{ user.username }}</div>
                <div class="td-sub">{{ user.profil?.no_hp || 'No HP -' }}</div>
                <div class="td-sub text-italic">{{ user.email }}</div>
              </td>
              <td>
                <div class="role-wrapper">
                   <ion-badge :color="getRoleColor(user.role)">{{ user.role }}</ion-badge>
                   <small class="jabatan-text">{{ user.profil?.jabatan }}</small>
                </div>
              </td>
              <td>
                <ion-chip :color="user.status === 'aktif' ? 'success' : 'danger'" outline>
                  <ion-label>{{ user.status }}</ion-label>
                </ion-chip>
              </td>
              <td>
                <div class="action-buttons">
                  <ion-button fill="clear" color="primary" @click="openEditModal(user)">
                    <ion-icon :icon="createOutline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" color="danger" @click="confirmDelete(user)">
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </ion-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ion-modal :is-open="isModalOpen" @didDismiss="isModalOpen = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ isEditing ? 'Update' : 'Registrasi' }} Karyawan</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isModalOpen = false">Batal</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="form-section">Data Akun</div>
          <ion-item fill="outline" mode="md" class="mt-10">
            <ion-label position="stacked">Username</ion-label>
            <ion-input v-model="form.username" placeholder="Contoh: budi_kasir"></ion-input>
          </ion-item>
          <ion-item fill="outline" mode="md" class="mt-10">
            <ion-label position="stacked">Email</ion-label>
            <ion-input v-model="form.email" type="email"></ion-input>
          </ion-item>
          <ion-item fill="outline" mode="md" class="mt-10">
            <ion-label position="stacked">Password {{ isEditing ? '(Kosongkan jika tidak ganti)' : '' }}</ion-label>
            <ion-input v-model="form.password" type="password"></ion-input>
          </ion-item>

          <div class="form-section mt-20">Data Profil Karyawan</div>
          <ion-item fill="outline" mode="md" class="mt-10">
            <ion-label position="stacked">Nomor HP</ion-label>
            <ion-input v-model="form.no_hp" type="tel"></ion-input>
          </ion-item>
          <ion-item fill="outline" mode="md" class="mt-10">
            <ion-label position="stacked">Jabatan Spesifik</ion-label>
            <ion-input v-model="form.jabatan" placeholder="Contoh: Kasir Senior"></ion-input>
          </ion-item>
          <ion-item fill="outline" mode="md" class="mt-10">
            <ion-label position="stacked">Alamat</ion-label>
            <ion-textarea v-model="form.alamat"></ion-textarea>
          </ion-item>
          
          <ion-item fill="outline" mode="md" class="mt-10">
            <ion-label position="stacked">Sistem Role</ion-label>
            <ion-select v-model="form.role">
              <ion-select-option value="kasir">Kasir</ion-select-option>
              <ion-select-option value="manager">Manager</ion-select-option>
              <ion-select-option value="owner">Owner</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item v-if="isEditing" fill="outline" mode="md" class="mt-10">
            <ion-label position="stacked">Status</ion-label>
            <ion-select v-model="form.status">
              <ion-select-option value="aktif">Aktif</ion-select-option>
              <ion-select-option value="non-aktif">Non-Aktif</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-button expand="block" color="success" class="mt-20 main-btn" @click="submitForm">
            {{ isEditing ? 'Simpan Perubahan' : 'Daftarkan Karyawan' }}
          </ion-button>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, 
  IonIcon, IonButton, IonBadge, IonSearchbar, IonModal, IonLabel, IonInput, 
  IonSelect, IonSelectOption, IonChip, IonItem, IonTextarea, IonRefresher, IonRefresherContent,
  alertController, toastController 
} from '@ionic/vue';
import { addOutline, createOutline, trashOutline, personAddOutline } from 'ionicons/icons';
import api from '@/services/api';

const users = ref<any[]>([]);
const searchQuery = ref('');
const isModalOpen = ref(false);
const isEditing = ref(false);
const selectedUserId = ref<number | null>(null);

const form = ref({
  username: '',
  email: '',
  password: '',
  role: 'kasir',
  status: 'aktif',
  no_hp: '',
  alamat: '',
  jabatan: ''
});

const loadUsers = async () => {
  try {
    const res = await api.get('/users');
    users.value = res.data.data; // Laravel Resource membungkus di 'data'
  } catch (error) {
    showToast('Gagal memuat data', 'danger');
  }
};

const filteredUsers = computed(() => {
  return users.value.filter(u => 
    u.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    u.profil?.jabatan?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const openAddModal = () => {
  isEditing.value = false;
  selectedUserId.value = null;
  form.value = { username: '', email: '', password: '', role: 'kasir', status: 'aktif', no_hp: '', alamat: '', jabatan: '' };
  isModalOpen.value = true;
};

const openEditModal = (user: any) => {
  isEditing.value = true;
  selectedUserId.value = user.id;
  form.value = {
    username: user.username,
    email: user.email,
    password: '', // Password dikosongkan saat edit
    role: user.role,
    status: user.status,
    no_hp: user.profil?.no_hp || '',
    alamat: user.profil?.alamat || '',
    jabatan: user.profil?.jabatan || ''
  };
  isModalOpen.value = true;
};

const submitForm = async () => {
  try {
    if (isEditing.value && selectedUserId.value) {
      await api.put(`/users/${selectedUserId.value}`, form.value);
      showToast('Data berhasil diperbarui');
    } else {
      await api.post('/users', form.value);
      showToast('Karyawan baru berhasil didaftarkan');
    }
    isModalOpen.value = false;
    loadUsers();
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Terjadi kesalahan';
    showToast(msg, 'danger');
  }
};

const confirmDelete = async (user: any) => {
  const alert = await alertController.create({
    header: 'Hapus Karyawan?',
    message: `Akun ${user.username} dan data profilnya akan dihapus permanen.`,
    buttons: [
      { text: 'Batal', role: 'cancel' },
      { 
        text: 'Hapus', 
        role: 'destructive',
        handler: async () => {
          await api.delete(`/users/${user.id}`);
          loadUsers();
          showToast('Data dihapus');
        }
      }
    ]
  });
  await alert.present();
};

const doRefresh = (event: any) => {
  loadUsers().finally(() => event.target.complete());
};

const showToast = async (msg: string, color = 'success') => {
  const toast = await toastController.create({ message: msg, duration: 2000, color });
  await toast.present();
};

const getRoleColor = (role: string) => {
  if (role === 'owner') return 'danger';
  if (role === 'manager') return 'warning';
  return 'primary';
};

onMounted(loadUsers);
</script>

<style scoped>
.gray-bg { --background: #F8FAFC; }
.owner-toolbar { --background: #ffffff; padding: 10px 5px; }
ion-title { font-weight: 800; font-size: 14px; color: #475569; letter-spacing: 1px; }
ion-title span { color: #10b981; }

.table-container { background: white; border-radius: 16px; overflow-x: auto; border: 1px solid #e2e8f0; }
.custom-table { width: 100%; border-collapse: collapse; min-width: 400px; }
.custom-table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 10px; color: #94a3b8; text-transform: uppercase; }
.custom-table td { padding: 12px; border-top: 1px solid #f1f5f9; vertical-align: middle; }

.td-name { font-weight: 700; color: #1e293b; font-size: 14px; }
.td-sub { font-size: 11px; color: #64748b; }
.text-italic { font-style: italic; opacity: 0.7; }

.role-wrapper { display: flex; flex-direction: column; gap: 4px; }
.jabatan-text { color: #64748b; font-size: 10px; font-weight: 600; }

.action-buttons { display: flex; gap: 5px; }
.form-section { font-weight: 800; font-size: 12px; color: #10b981; text-transform: uppercase; border-left: 3px solid; padding-left: 8px; }
.mt-10 { margin-top: 10px; }
.mt-20 { margin-top: 20px; }
.main-btn { --border-radius: 12px; height: 50px; font-weight: 700; }
</style>
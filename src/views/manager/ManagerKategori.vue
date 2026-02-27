<template>
    <ion-page>
        <ion-header class="ion-no-border">
            <ion-toolbar class="main-toolbar">
                <ion-buttons slot="start">
                    <ion-menu-button></ion-menu-button>
                </ion-buttons>
                <ion-title>SYSTEM <span>CATEGORIES</span></ion-title>
                <ion-buttons slot="end">
                    <button class="btn-add-menu" @click="openModalAdd()">
                        <ion-icon :icon="addOutline"></ion-icon>
                        <span>Tambah</span>
                    </button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding" style="--background: #F8FAFC;">
            <div class="search-wrapper">
                <ion-searchbar v-model="searchQuery" placeholder="Cari kategori produk..." class="custom-search"
                    mode="ios">
                </ion-searchbar>
            </div>

            <ion-grid>
                <ion-row>
                    <ion-col size="12" v-for="cat in filteredCategories" :key="cat.id">
                        <div class="category-item-card">
                            <div class="cat-decoration">
                                <ion-icon :icon="layersOutline"></ion-icon>
                            </div>

                            <div class="cat-info">
                                <span class="cat-id">#CAT-{{ cat.id }}</span>
                                <h2 class="cat-name">{{ cat.nama }}</h2>
                            </div>

                            <div class="cat-actions">
                                <button class="btn-action edit" @click="openModalEdit(cat)">
                                    <ion-icon :icon="createOutline"></ion-icon>
                                </button>
                                <button class="btn-action delete" @click="confirmDelete(cat)">
                                    <ion-icon :icon="trashOutline"></ion-icon>
                                </button>
                            </div>
                        </div>
                    </ion-col>
                </ion-row>
            </ion-grid>

            <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="ion-hide-sm-up">
                <ion-fab-button class="main-fab" @click="openModalAdd()">
                    <ion-icon :icon="addOutline"></ion-icon>
                </ion-fab-button>
            </ion-fab>

            <ion-modal :is-open="isModalOpen" @didDismiss="isModalOpen = false" :initial-breakpoint="0.5"
                :breakpoints="[0, 0.5, 0.8]" handle-behavior="cycle">
                <div class="modal-content-wrapper">
                    <div class="modal-header">
                        <div class="header-indicator"></div>
                        <h3>{{ isEditMode ? 'Edit Category' : 'New Category' }}</h3>
                        <p>Pastikan nama kategori spesifik dan jelas.</p>
                    </div>

                    <div class="modal-body">
                        <div class="input-group">
                            <label>Nama Kategori</label>
                            <input type="text" v-model="catForm.nama_kategori" placeholder="Contoh: Signature Dish"
                                maxlength="100" />
                        </div>

                        <button class="btn-submit-form" @click="submitForm">
                            {{ isEditMode ? 'Update Category' : 'Save Category' }}
                        </button>
                        <button class="btn-cancel-form" @click="isModalOpen = false">Batal</button>
                    </div>
                </div>
            </ion-modal>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol,
    IonIcon, IonButtons, IonMenuButton, IonModal, IonSearchbar, IonFab,
    IonFabButton, alertController
} from '@ionic/vue';
// Gabungkan semua icon di satu tempat
import { layersOutline, addOutline, createOutline, trashOutline } from 'ionicons/icons';
import api from '@/services/api';

const categories = ref<any[]>([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const searchQuery = ref('');
const selectedId = ref<number | null>(null);

const catForm = ref({
    nama_kategori: ''
});

// --- LOGIKA CRUD TETAP SAMA ---
const loadCategories = async () => {
    try {
        const res = await api.get('/kategoris');
        categories.value = res.data.data;
    } catch (error) {
        console.error("Gagal memuat kategori", error);
    }
};

const filteredCategories = computed(() => {
    if (!searchQuery.value) return categories.value;
    return categories.value.filter(c =>
        c.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const openModalAdd = () => {
    isEditMode.value = false;
    catForm.value.nama_kategori = '';
    isModalOpen.value = true;
};

const openModalEdit = (cat: any) => {
    isEditMode.value = true;
    selectedId.value = cat.id;
    catForm.value.nama_kategori = cat.nama;
    isModalOpen.value = true;
};

const submitForm = async () => {
    if (!catForm.value.nama_kategori.trim()) return; // Tambahkan .trim()

    try {
        const payload = {
            nama_kategori: catForm.value.nama_kategori
        };

        if (isEditMode.value && selectedId.value) {
            await api.put(`/kategoris/${selectedId.value}`, payload);
        } else {
            await api.post('/kategoris', payload);
        }

        isModalOpen.value = false;
        await loadCategories(); // Gunakan await agar urutan eksekusi jelas
    } catch (error: any) {
        // Penanganan error yang lebih aman
        const errorMessage = error.response?.data?.message || "Koneksi ke server terputus";
        const alert = await alertController.create({
            header: 'Gagal',
            message: errorMessage,
            buttons: ['OK']
        });
        await alert.present();
    }
};

const confirmDelete = async (cat: any) => {
    const alert = await alertController.create({
        header: 'Hapus Kategori?',
        message: `Menghapus "${cat.nama}" akan membuat menu di kategori ini menjadi 'Tanpa Kategori'.`,
        buttons: [
            { text: 'Batal', role: 'cancel' },
            {
                text: 'Hapus',
                role: 'destructive',
                handler: async () => {
                    try {
                        await api.delete(`/kategoris/${cat.id}`);
                        loadCategories();
                    } catch (e) { console.error(e); }
                }
            }
        ]
    });
    await alert.present();
};

onMounted(loadCategories);
</script>

<style scoped>
/* 1. Toolbar Style */
.main-toolbar {
    --background: #ffffff;
    padding-top: 8px;
}

ion-title {
    font-weight: 900;
    font-size: 11px;
    color: #94a3b8;
    letter-spacing: 2px;
}

ion-title span {
    color: #0f172a;
}


.btn-add-menu {
  background: #0f172a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  margin-right: 12px;
}

/* 2. Search Box */
.search-wrapper {
    margin-bottom: 10px;
}

.custom-search {
    --background: #ffffff;
    --border-radius: 16px;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

/* 3. Category Card Design */
.category-item-card {
    background: white;
    border-radius: 20px;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 16px;
    border: 1px solid rgba(226, 232, 240, 0.7);
    margin-bottom: 4px;
    transition: 0.3s ease;
}

.category-item-card:hover {
    border-color: #e11d48;
    transform: translateY(-2px);
}

.cat-decoration {
    background: #f8fafc;
    width: 50px;
    height: 50px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #0f172a;
}

.cat-info {
    flex: 1;
}

.cat-id {
    font-size: 10px;
    font-weight: 800;
    color: #cbd5e1;
    letter-spacing: 0.5px;
}

.cat-name {
    margin: 2px 0 0;
    font-size: 17px;
    font-weight: 850;
    color: #0f172a;
}

.cat-actions {
    display: flex;
    gap: 8px;
}

.btn-action {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: 0.2s;
}

.edit {
    background: #f1f5f9;
    color: #64748b;
}

.delete {
    background: #fff1f2;
    color: #e11d48;
}

.btn-action:active {
    transform: scale(0.85);
}

/* 4. Modal Stylings */
.category-modal {
    --height: auto;
    --border-radius: 30px;
    --align-items: center;
}

.modal-content-wrapper {
    padding: 30px 24px;
    text-align: center;
    background: white;
}

.header-indicator {
    width: 40px;
    height: 5px;
    background: #f1f5f9;
    border-radius: 10px;
    margin: 0 auto 20px;
}

.modal-header h3 {
    font-size: 20px;
    font-weight: 900;
    color: #0f172a;
    margin: 0;
}

.modal-header p {
    font-size: 13px;
    color: #64748b;
    margin: 8px 0 24px;
}

.input-group {
    text-align: left;
    margin-bottom: 25px;
}

.input-group label {
    font-size: 11px;
    font-weight: 800;
    color: #64748b;
    /* Slate 500: Lebih gelap dari sebelumnya */
    text-transform: uppercase;
    margin-left: 5px;
    display: block;
    margin-bottom: 8px;
}

.input-group input {
    width: 100%;
    /* Gunakan warna abu-abu yang lebih kontras (Slate 100) */
    background: #f1f5f9;
    /* Border tipis agar bentuknya jelas */
    border: 1.5px solid #e2e8f0;
    padding: 16px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    outline: none;
    transition: all 0.2s ease-in-out;
}

/* Efek saat input diklik/fokus */
.input-group input:focus {
    border-color: #0f172a;
    /* Warna Slate 900 */
    background: #ffffff;
    /* Tambahkan shadow lembut agar terlihat "pop out" */
    box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.05);
}

/* Placeholder dibuat lebih soft agar tidak bertabrakan dengan teks utama */
.input-group input::placeholder {
    color: #94a3b8;
    font-weight: 400;
}

.btn-submit-form {
    width: 100%;
    padding: 16px;
    background: #0f172a;
    color: white;
    border: none;
    border-radius: 16px;
    font-weight: 700;
    margin-bottom: 12px;
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
}

.btn-cancel-form {
    width: 100%;
    padding: 16px;
    background: transparent;
    color: #94a3b8;
    border: none;
    font-weight: 700;
}

.main-fab {
    --background: #e11d48;
    --color: white;
}
</style>
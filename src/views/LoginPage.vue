<template>
  <ion-page>
    <ion-content class="login-bg">
      <div class="login-container">
        <div class="login-card">
          
          <div class="brand-section">
            <div class="logo-wrapper">
              <div class="logo-circle">
                <ion-icon :icon="restaurantOutline"></ion-icon>
              </div>
              <div class="logo-ring"></div>
            </div>
            <h1>Resto<span>App</span></h1>
            <p>Sistem Kasir Pintar & Terpadu</p>
          </div>

          <div class="form-section">
            <div class="input-group">
              <ion-label>Username</ion-label>
              <div class="input-wrapper">
                <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
                <ion-input 
                  v-model="form.username" 
                  placeholder="admin_kasir"
                  class="custom-input">
                </ion-input>
              </div>
            </div>

            <div class="input-group">
              <ion-label>Password</ion-label>
              <div class="input-wrapper">
                <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                <ion-input 
                  v-model="form.password" 
                  type="password" 
                  placeholder="••••••••"
                  class="custom-input">
                </ion-input>
              </div>
            </div>

            <button 
              class="login-btn-new" 
              @click="handleLogin" 
              :disabled="isLoading">
              <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
              <span v-else>Masuk Sekarang</span>
            </button>

            <p v-if="errorMessage" class="error-text">
              <ion-icon :icon="alertCircleOutline"></ion-icon> {{ errorMessage }}
            </p>
          </div>

        </div>
        <p class="footer-text">© 2024 RestoApp Premium Edition</p>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { 
  IonPage, IonContent, IonItem, IonInput, IonButton, 
  IonIcon, IonSpinner, IonLabel, toastController 
} from '@ionic/vue';
import { 
  restaurantOutline,
  personOutline,
  lockClosedOutline
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const isLoading = ref(false);
const errorMessage = ref('');
const form = ref({ username: '', password: '' });

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    errorMessage.value = 'Data login tidak lengkap';
    return;
  }

  isLoading.value = true;
  errorMessage.value = ''; // Reset error message tiap kali mencoba

  try {
    const response = await api.post('/login', form.value);
    
    // 1. Ambil data penting dari response
    const { access_token, user } = response.data;
    const role = user.role.toLowerCase().trim(); // Pastikan kecil dan tanpa spasi

    // 2. Simpan ke Storage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_data', JSON.stringify(user));

    // 3. Tampilkan Toast
    const toast = await toastController.create({
      message: `Selamat Datang, ${user.username}!`,
      duration: 1500,
      color: 'dark',
      position: 'top'
    });
    await toast.present();

    // 4. Logika Redirect yang lebih aman
    console.log("Login sukses, role anda:", role); // Untuk debugging di console browser

    if (role === 'owner') {
      await router.replace('/owner/dashboard');
    } else if (role === 'manager') {
      await router.replace('/manager/dashboard'); // Perbaikan double slash
    } else {
      await router.replace('/kasir');
    }
    
  } catch (error: any) {
    console.error("Login Error:", error);
    if (error.response && error.response.status === 401) {
      errorMessage.value = 'Username atau Password salah';
    } else {
      errorMessage.value = 'Gagal terhubung ke server';
    }
  } finally {
    isLoading.value = false;
  }
};

</script>
<style scoped>
/* ================= RESPONSIVE ================= */

/* Mobile kecil */
@media (max-width: 480px) {

  .login-container {
    padding: 16px;
  }

  .login-card {
    padding: 30px 20px;
    border-radius: 24px;
  }

  h1 {
    font-size: 22px;
  }

  .logo-wrapper {
    width: 75px;
    height: 75px;
  }

  .logo-circle {
    font-size: 34px;
  }

  .login-btn-new {
    height: 52px;
    font-size: 15px;
  }

}

/* Tablet */
@media (min-width: 768px) {

  .login-card {
    max-width: 420px;
  }

}


/* Background menggunakan Slate yang sangat gelap, bukan hitam murni */
.login-bg {
   --background: radial-gradient(circle at top right, #1e293b, #0f172a);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-bg::part(scroll) {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Card dengan efek Soft Glassmorphism */
.login-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 32px;
  padding: 40px 30px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Brand Section */
.brand-section {
  text-align: center;
  margin-bottom: 35px;
}

.logo-wrapper {
  position: relative;
  width: 90px;
  height: 90px;
  margin: 0 auto 20px;
}

.logo-circle {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  color: #10b981; /* Aksen Emerald */
  z-index: 2;
  position: relative;
}

.logo-ring {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 2px solid #10b981;
  border-radius: 32px;
  opacity: 0.3;
}

h1 {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.5px;
}

h1 span {
  color: #10b981;
}

.brand-section p {
  font-size: 14px;
  color: #64748b;
  margin-top: 5px;
}

/* Input Styles */
.input-group {
  margin-bottom: 22px;
}

.input-group ion-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
  margin-left: 4px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #94a3b8;
  font-size: 20px;
  transition: 0.3s;
}

.custom-input {
  --padding-start: 48px;
  --background: #f1f5f9;
  --border-radius: 16px;
  --color: #0f172a;
  --placeholder-color: #94a3b8;
  border: 2px solid transparent;
  border-radius: 16px;
  min-height: 56px;
  transition: 0.3s;
    width: 100%;
}

.custom-input:focus-within {
  border-color: #10b981;
  background: #ffffff;
}

/* Button Modern */
.login-btn-new {
  width: 100%;
  height: 58px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 18px;
  font-weight: 700;
  font-size: 16px;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
}

.login-btn-new:active {
  transform: scale(0.97);
}

.login-btn-new:hover {
  background: #1e293b;
  box-shadow: 0 15px 25px rgba(15, 23, 42, 0.3);
}

.footer-text {
  margin-top: 30px;
  font-size: 12px;
  color: #64748b;
  letter-spacing: 0.5px;
}

.error-text {
  color: #ef4444;
  font-size: 13px;
  text-align: center;
  margin-top: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
</style>
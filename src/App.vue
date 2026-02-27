<template>
  <ion-app>
    <ion-split-pane  :disabled="isLoginPage" 
  when="(min-width: 992px)" 
  content-id="main-content">
      <Sidebar v-if="!isLoginPage" @logout="handleLogout" />

      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/vue';
import Sidebar from '@/components/Sidebar.vue';

const route = useRoute();
const router = useRouter();

// Mengecek apakah rute aktif adalah login
const isLoginPage = computed(() => route.path === '/login');

const handleLogout = () => {
  localStorage.clear();
  router.replace('/login');
};
</script>
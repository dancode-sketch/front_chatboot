<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

onMounted(() => {
  // Verificar autenticación al cargar la app
  authStore.checkAuth();
});
</script>

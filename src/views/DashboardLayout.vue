<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <AppSidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main Content -->
    <div
      :class="[
        'flex-1 flex flex-col min-w-0 transition-all duration-300',
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-0',
      ]"
    >
      <!-- Header -->
      <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Page Content -->
      <main class="flex-1 overflow-auto">
        <!-- Ejemplo de roles: muestras u ocultar elementos según autorización -->
        <div class="p-4 border-b border-gray-200 bg-white">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-semibold">Acciones rápidas</div>
              <div class="text-xs text-gray-500">
                Roles: {{ authStore.roleList.join(", ") || "Ninguno" }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-role="['ADMIN']"
                class="px-3 py-1 rounded bg-blue-600 text-white text-xs"
              >
                Vista Admin
              </button>
              <button
                v-role="['CAJERO']"
                class="px-3 py-1 rounded bg-green-600 text-white text-xs"
              >
                Cerrar caja
              </button>
            </div>
          </div>
        </div>

        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import AppSidebar from "@/components/common/AppSidebar.vue";
import AppHeader from "@/components/common/AppHeader.vue";
import { useWebSocketStore } from "@/stores/websocket";
import { useMensajesStore } from "@/stores/mensajes";
import { useAuthStore } from "@/stores/auth";

const wsStore = useWebSocketStore();
const mensajesStore = useMensajesStore();
const authStore = useAuthStore();
const sidebarOpen = ref(true);
let mensajesInterval = null;

onMounted(() => {
  // Conectar WebSocket al montar el dashboard
  wsStore.startConnection();

  // cargar contador de mensajes sin leer únicamente si estamos autenticados
  if (authStore.isAuthenticated) {
    mensajesStore.cargarMensajesSinLeer();
    mensajesInterval = setInterval(() => {
      mensajesStore.cargarMensajesSinLeer();
    }, 30000);
  }

  // si el usuario pierde autenticación (token expirado se limpia), detener intervalo
  watch(
    () => authStore.isAuthenticated,
    (val) => {
      if (!val && mensajesInterval) {
        clearInterval(mensajesInterval);
        mensajesInterval = null;
      }
    },
  );
});

onUnmounted(() => {
  // Desconectar WebSocket al desmontar
  wsStore.stopConnection();
});
</script>

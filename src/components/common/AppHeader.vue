<template>
  <header
    class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6"
  >
    <!-- Left Section -->
    <div class="flex items-center space-x-3">
      <!-- Hamburger Menu Button (desktop/tablet + móvil) -->
      <button
        @click="$emit('toggle-sidebar')"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Menú"
      >
        <svg
          class="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <!-- Page Title -->
      <div>
        <h1 class="text-lg md:text-xl font-semibold text-gray-900">
          {{ pageTitle }}
        </h1>
        <p class="text-xs md:text-sm text-gray-500 hidden sm:block">
          {{ pageSubtitle }}
        </p>
      </div>
    </div>

    <!-- User Menu -->
    <div class="flex items-center space-x-2 md:space-x-4">
      <!-- User Info (oculto en móvil) -->
      <div class="text-right hidden md:block">
        <p class="text-sm font-medium text-gray-900">
          {{ user?.nombre_completo || user?.username }}
        </p>
        <p class="text-xs text-gray-500">{{ user?.email }}</p>
      </div>

      <!-- Avatar -->
      <div
        class="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium"
      >
        {{ userInitials }}
      </div>

      <!-- Logout Button -->
      <button
        @click="handleLogout"
        class="px-2 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Cerrar sesión"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotify } from "@/composables/useNotify";
import { getInitials } from "@/utils/formatters";

defineEmits(["toggle-sidebar"]);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const notify = useNotify();

const user = computed(() => authStore.user);
const userInitials = computed(() =>
  getInitials(user.value?.nombre_completo || user.value?.username || ""),
);

const pageTitle = computed(() => {
  if (route.path.includes("/kds")) return "Kitchen Display System";
  if (route.path.includes("/chat")) return "Atención al Cliente";
  return "Dashboard";
});

const pageSubtitle = computed(() => {
  if (route.path.includes("/kds")) return "Gestión de pedidos en tiempo real";
  if (route.path.includes("/chat")) return "Mensajería con clientes";
  return "Sistema de gestión";
});

function handleLogout() {
  authStore.logout();
  notify.info("Sesión cerrada");
  router.push("/login");
}
</script>

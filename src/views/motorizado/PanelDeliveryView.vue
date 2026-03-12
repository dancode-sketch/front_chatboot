<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Móvil -->
    <header
      class="bg-gradient-to-r from-blue-600 to-green-600 text-white sticky top-0 z-10 shadow-lg"
    >
      <div class="px-4 py-4">
        <!-- Fila superior: Info motorizado + Menu -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0"
            >
              <img
                v-if="authStore.motorizado?.foto_url"
                :src="authStore.motorizado.foto_url"
                :alt="authStore.motorizado.nombre"
                class="w-full h-full object-cover"
              />
              <svg
                v-else
                class="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div class="font-semibold text-lg">
                {{ authStore.motorizado?.nombre || "Motorizado" }}
              </div>
              <div class="text-xs text-blue-100">
                {{ authStore.motorizado?.telefono || "" }}
              </div>
            </div>
          </div>

          <!-- Botón Menú -->
          <button
            @click="mostrarMenu = !mostrarMenu"
            class="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <svg
              class="w-6 h-6"
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
        </div>

        <!-- Stats rápidas -->
        <div class="grid grid-cols-3 gap-2">
          <div
            class="bg-white/10 backdrop-blur rounded-lg px-3 py-2 text-center"
          >
            <div class="text-xs text-blue-100 mb-1">Asignados</div>
            <div class="text-xl font-bold">{{ pedidosAsignados.length }}</div>
          </div>
          <div
            class="bg-white/10 backdrop-blur rounded-lg px-3 py-2 text-center"
          >
            <div class="text-xs text-blue-100 mb-1">En Camino</div>
            <div class="text-xl font-bold">{{ pedidosEnCamino.length }}</div>
          </div>
          <div
            class="bg-white/10 backdrop-blur rounded-lg px-3 py-2 text-center"
          >
            <div class="text-xs text-blue-100 mb-1">Estado</div>
            <div class="text-sm font-semibold">
              {{ authStore.motorizado?.disponible ? "✓ Activo" : "✗ Inactivo" }}
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Menú Desplegable -->
    <div
      v-if="mostrarMenu"
      class="fixed inset-0 z-50"
      @click="mostrarMenu = false"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      <div
        class="absolute top-0 right-0 bg-white w-64 h-full shadow-2xl"
        @click.stop
      >
        <div class="p-4">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Menú</h3>
            <button
              @click="mostrarMenu = false"
              class="p-2 hover:bg-gray-100 rounded-lg transition"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="space-y-2">
            <!-- Toggle Disponibilidad -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div
                class="flex items-center justify-between mb-2"
                @click="toggleDisponibilidad"
              >
                <span class="text-sm font-medium text-gray-700"
                  >Disponibilidad</span
                >
                <button
                  @click.stop="toggleDisponibilidad"
                  :class="[
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    authStore.motorizado?.disponible
                      ? 'bg-green-600'
                      : 'bg-gray-300',
                  ]"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      authStore.motorizadoUser?.disponible
                        ? 'translate-x-5'
                        : 'translate-x-0',
                    ]"
                  />
                </button>
              </div>
              <p class="text-xs text-gray-600">
                {{
                  authStore.motorizado?.disponible
                    ? "Disponible para asignaciones"
                    : "No disponible"
                }}
              </p>
            </div>

            <!-- Botón Actualizar -->
            <button
              @click="cargarPedidos"
              :disabled="cargando"
              class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg
                :class="['w-5 h-5', cargando && 'animate-spin']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Actualizar Pedidos
            </button>

            <!-- Botón Cerrar Sesión -->
            <button
              @click="handleLogout"
              class="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
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
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido Principal -->
    <main class="container mx-auto px-4 py-6 max-w-4xl">
      <!-- Loading -->
      <div
        v-if="cargando && pedidos.length === 0"
        class="flex justify-center items-center py-20"
      >
        <div class="text-center">
          <svg
            class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="text-gray-600">Cargando pedidos...</p>
        </div>
      </div>

      <!-- Sin Pedidos -->
      <div
        v-else-if="!cargando && pedidos.length === 0"
        class="bg-white rounded-xl shadow-sm p-8 text-center"
      >
        <div
          class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          Sin pedidos asignados
        </h3>
        <p class="text-gray-600 mb-6">
          No tienes pedidos asignados en este momento
        </p>
        <button
          @click="cargarPedidos"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          Actualizar
        </button>
      </div>

      <!-- Lista de Pedidos -->
      <div v-else class="space-y-4">
        <!-- Pedidos En Camino (prioridad) -->
        <div v-if="pedidosEnCamino.length > 0">
          <button
            @click="collapsedEnCamino = !collapsedEnCamino"
            class="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors group w-full mb-3"
          >
            <h2
              class="text-lg font-bold text-indigo-700 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                />
                <path
                  d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"
                />
              </svg>
              En Camino
            </h2>
            <span
              class="px-2.5 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium"
            >
              {{ pedidosEnCamino.length }}
            </span>
            <svg
              class="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ml-auto"
              :class="{ 'rotate-180': collapsedEnCamino }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div v-show="!collapsedEnCamino" class="space-y-3">
            <PedidoMotorizadoCard
              v-for="pedido in pedidosEnCamino"
              :key="pedido.id"
              :pedido="pedido"
              @cambiar-estado="handleActualizarEstado"
            />
          </div>
        </div>

        <!-- Pedidos Asignados -->
        <div v-if="pedidosAsignados.length > 0">
          <button
            @click="collapsedAsignados = !collapsedAsignados"
            class="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors group w-full mb-3"
          >
            <h2
              class="text-lg font-bold text-amber-700 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clip-rule="evenodd"
                />
              </svg>
              Asignados
            </h2>
            <span
              class="px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-medium"
            >
              {{ pedidosAsignados.length }}
            </span>
            <svg
              class="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ml-auto"
              :class="{ 'rotate-180': collapsedAsignados }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div v-show="!collapsedAsignados" class="space-y-3">
            <PedidoMotorizadoCard
              v-for="pedido in pedidosAsignados"
              :key="pedido.id"
              :pedido="pedido"
              @cambiar-estado="handleActualizarEstado"
            />
          </div>
        </div>
      </div>

      <!-- Última actualización -->
      <div
        v-if="pedidos.length > 0"
        class="text-center text-sm text-gray-500 mt-6"
      >
        Última actualización: {{ formatearHora(ultimaActualizacion) }}
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthMotorizadoStore } from "@/stores/authMotorizado";
import { usePedidosStore } from "@/stores/pedidos";
import { useMotorizadosStore } from "@/stores/motorizados";
import { useNotify } from "@/composables/useNotify";
import PedidoMotorizadoCard from "@/components/delivery/PedidoMotorizadoCard.vue";
import { ESTADO_PEDIDO } from "@/utils/constants";

const router = useRouter();
const authStore = useAuthMotorizadoStore();
const pedidosStore = usePedidosStore();
const motorizadosStore = useMotorizadosStore();
const notify = useNotify();

const pedidos = ref([]);
const cargando = ref(false);
const mostrarMenu = ref(false);
const ultimaActualizacion = ref(new Date());

// Estados de colapso: En Camino expandido por defecto, Asignados colapsado si hay En Camino
const collapsedEnCamino = ref(false);
const collapsedAsignados = ref(false);

let intervaloActualizacion = null;

// Computados
const pedidosAsignados = computed(() =>
  pedidos.value.filter((p) => p.estado === ESTADO_PEDIDO.ASIGNADO),
);

const pedidosEnCamino = computed(() =>
  pedidos.value.filter((p) => p.estado === ESTADO_PEDIDO.EN_CAMINO),
);

// Watch para ajustar estado de colapso automáticamente
watch(
  [pedidosEnCamino, pedidosAsignados],
  ([enCamino, asignados]) => {
    // Si hay pedidos en camino, colapsar asignados
    // Si NO hay en camino pero hay asignados, expandir asignados
    if (enCamino.length > 0) {
      collapsedAsignados.value = true;
    } else if (asignados.length > 0) {
      collapsedAsignados.value = false;
    }
  },
  { immediate: true },
);

// Cargar pedidos
async function cargarPedidos() {
  cargando.value = true;

  try {
    const { data, success, error } =
      await pedidosStore.fetchMisPedidosDelivery();

    if (success && data) {
      pedidos.value = data;
      ultimaActualizacion.value = new Date();
    } else {
      console.error("Error al cargar pedidos:", error);
    }
  } catch (error) {
    console.error("Error al cargar pedidos:", error);
  } finally {
    cargando.value = false;
  }
}

// Actualizar estado de pedido
async function handleActualizarEstado({ pedidoId, estado }) {
  console.log("handleActualizarEstado called", pedidoId, estado);
  try {
    const { success, error } = await pedidosStore.actualizarEstadoDelivery(
      pedidoId,
      estado,
    );

    if (success) {
      notify.success(`Pedido #${pedidoId} marcado como ${estado}`);
      await cargarPedidos();
    } else {
      notify.error(error || "Error al actualizar estado");
    }
  } catch (error) {
    notify.error("Error al actualizar estado");
    console.error("Error:", error);
  }
}

// Toggle disponibilidad
async function toggleDisponibilidad() {
  console.log("🔄 toggleDisponibilidad clicked");
  if (!authStore.motorizado) return;

  try {
    const estadoActual = authStore.motorizado.disponible;
    const nuevoEstado = !estadoActual;
    console.log(
      "📊 Estado actual:",
      estadoActual,
      "→ Nuevo estado:",
      nuevoEstado,
    );

    const { success, error, data } =
      await motorizadosStore.cambiarDisponibilidad(
        authStore.motorizado.id,
        nuevoEstado,
      );

    console.log("✅ Respuesta del servidor:", { success, error, data });

    if (success) {
      authStore.motorizado.disponible = nuevoEstado;
      console.log(
        "✔️ Estado actualizado en authStore:",
        authStore.motorizado.disponible,
      );
      notify.success(
        nuevoEstado ? "Ahora estás disponible" : "Marcado como no disponible",
      );
    } else {
      notify.error(error || "Error al cambiar disponibilidad");
    }
  } catch (error) {
    notify.error("Error al cambiar disponibilidad");
    console.error("❌ Error:", error);
  }
}

// Logout
function handleLogout() {
  authStore.logout();
  notify.info("Sesión cerrada");
  router.push("/motorizado/login");
}

// Formatear hora
function formatearHora(fecha) {
  return new Date(fecha).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Lifecycle
onMounted(() => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push("/motorizado/login");
    return;
  }

  // Debug: Ver estado inicial del motorizado
  console.log("🚗 Motorizado cargado:", authStore.motorizado);
  console.log("📍 Disponible:", authStore.motorizado?.disponible);

  // Cargar pedidos inicial
  cargarPedidos();

  // Auto-refresh cada 30 segundos
  intervaloActualizacion = setInterval(() => {
    cargarPedidos();
  }, 30000);
});

onUnmounted(() => {
  if (intervaloActualizacion) {
    clearInterval(intervaloActualizacion);
  }
});
</script>

<template>
  <div class="h-full flex">
    <!-- Lista de Clientes (30%) - Oculta en móvil cuando hay cliente seleccionado -->
    <div
      class="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col"
      :class="{ 'hidden md:flex': clienteSeleccionado }"
    >
      <!-- Header de Lista -->
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Clientes Activos</h2>
        <p class="text-sm text-gray-500 mt-1">
          {{ clientesStore.clientes.length }} conversaciones
        </p>
      </div>

      <!-- Lista de Clientes -->
      <div class="flex-1 overflow-y-auto scrollbar-thin">
        <ClienteItem
          v-for="cliente in clientesStore.clientes"
          :key="cliente.id"
          :cliente="cliente"
          :activo="clienteSeleccionado?.id === cliente.id"
          @seleccionar="seleccionarCliente"
        />

        <!-- Empty State -->
        <div
          v-if="clientesStore.clientes.length === 0 && !loading"
          class="flex flex-col items-center justify-center py-12 px-4 text-gray-400"
        >
          <svg
            class="w-16 h-16 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
          <p class="text-sm font-medium">No hay clientes activos</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <svg
            class="animate-spin h-8 w-8 text-primary"
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
        </div>
      </div>
    </div>

    <!-- Área de Conversación (70%) - Mostrada en toda la pantalla en móvil -->
    <div
      class="flex-1 flex flex-col bg-gray-50"
      :class="{ 'hidden md:flex': !clienteSeleccionado }"
    >
      <ChatArea v-if="clienteSeleccionado" @volver-lista="volverALista" />

      <!-- Empty State -->
      <div v-else class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div
            class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            Selecciona una conversación
          </h3>
          <p class="text-gray-500">
            Elige un cliente de la lista para ver sus mensajes
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useClientesStore } from "@/stores/clientes";
import { useMensajesStore } from "@/stores/mensajes";
import { useNotify } from "@/composables/useNotify";
import ClienteItem from "@/components/chat/ClienteItem.vue";
import ChatArea from "@/components/chat/ChatArea.vue";

const route = useRoute();
const clientesStore = useClientesStore();
const mensajesStore = useMensajesStore();
const notify = useNotify();

const loading = ref(false);

const clienteSeleccionado = computed(() => clientesStore.clienteSeleccionado);

onMounted(() => {
  fetchClientes();
});

// si viene teléfono en la query, selecciónalo al cargar o cuando cambie
watch(
  () => route.query.telefono,
  (telefono) => {
    if (telefono) {
      seleccionarCliente(telefono);
    }
  },
  { immediate: true },
);

// cuando cambia el cliente seleccionado, reducir contador
watch(
  () => clientesStore.clienteSeleccionado,
  (nuevo) => {
    if (nuevo) {
      mensajesStore.marcarComoLeido(nuevo.id);
    }
  },
);

async function fetchClientes() {
  loading.value = true;
  const { success, error } = await clientesStore.fetchClientesActivos();
  loading.value = false;

  if (!success) {
    notify.error(error || "Error al cargar clientes");
  }
}

async function seleccionarCliente(telefono) {
  const { success, error } = await clientesStore.seleccionarCliente(telefono);

  if (success && clientesStore.clienteSeleccionado) {
    // marcar como leídos los mensajes de este cliente
    mensajesStore.marcarComoLeido(clientesStore.clienteSeleccionado.id);
  }

  if (!success) {
    notify.error(error || "Error al cargar mensajes");
  }
}

function volverALista() {
  // En móvil, deseleccionar cliente para volver a la lista
  clientesStore.deseleccionarCliente();
}
</script>

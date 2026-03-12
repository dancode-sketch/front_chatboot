<template>
  <div class="flex flex-col h-full">
    <!-- Header del Chat -->
    <div class="bg-white border-b border-gray-200 p-3 md:p-4 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center flex-1 min-w-0">
          <!-- Botón Volver (solo móvil) -->
          <button
            @click="$emit('volver-lista')"
            class="md:hidden mr-2 p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            title="Volver a la lista"
          >
            <svg
              class="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div
            class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium flex-shrink-0"
          >
            {{ getInitials(cliente.nombre || cliente.telefono) }}
          </div>
          <div class="ml-2 md:ml-3 flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <p
                class="text-sm md:text-base font-semibold text-gray-900 truncate"
              >
                {{ cliente.nombre || "Cliente" }}
              </p>
              <!-- Botón para editar nombre -->
              <button
                @click="abrirModalNombre"
                class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                title="Editar nombre"
              >
                <svg
                  class="w-3 h-3 md:w-4 md:h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                  />
                </svg>
              </button>
            </div>
            <p class="text-xs text-gray-500">
              {{ formatPhone(cliente.telefono) }}
            </p>
          </div>
        </div>

        <!-- Toggle del Bot -->
        <div class="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
          <div class="text-xs md:text-sm text-gray-600 hidden sm:block">
            <span class="font-medium">Bot:</span>
          </div>
          <button
            @click="toggleBot"
            :disabled="loadingBot"
            class="relative inline-flex h-5 w-10 md:h-6 md:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            :class="cliente.bot_pausado ? 'bg-gray-300' : 'bg-green-500'"
          >
            <span
              class="inline-block h-3 w-3 md:h-4 md:w-4 transform rounded-full bg-white transition-transform"
              :class="
                cliente.bot_pausado
                  ? 'translate-x-1'
                  : 'translate-x-5 md:translate-x-6'
              "
            />
          </button>
          <span
            class="text-xs md:text-sm font-medium hidden sm:inline"
            :class="cliente.bot_pausado ? 'text-red-600' : 'text-green-600'"
          >
            {{ cliente.bot_pausado ? "Pausado" : "Activo" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Área de Mensajes con Scroll Propio -->
    <div
      ref="messagesContainer"
      @scroll="handleScroll"
      class="flex-1 overflow-y-auto scrollbar-thin p-3 md:p-4 space-y-2 md:space-y-3"
      style="max-height: calc(100vh - 200px)"
    >
      <!-- Indicador de carga en la parte superior -->
      <div v-if="loadingOlder" class="flex justify-center py-2">
        <div class="flex items-center space-x-2 text-gray-500 text-sm">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
          <span>Cargando mensajes anteriores...</span>
        </div>
      </div>

      <!-- Indicador: No hay más mensajes -->
      <div
        v-else-if="!hasMore && mensajes.length > 0"
        class="flex justify-center py-2"
      >
        <span class="text-xs text-gray-400">
          ── Inicio de la conversación ──
        </span>
      </div>

      <!-- Mensajes -->
      <ChatBubble
        v-for="mensaje in mensajes"
        :key="mensaje.id"
        :mensaje="mensaje"
      />

      <!-- Loading inicial -->
      <div
        v-if="loadingMensajes && mensajes.length === 0"
        class="flex justify-center py-8"
      >
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

      <!-- Empty State -->
      <div
        v-if="mensajes.length === 0 && !loadingMensajes"
        class="flex flex-col items-center justify-center py-12 text-gray-400"
      >
        <svg
          class="w-12 h-12 mb-2"
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
        <p class="text-sm">No hay mensajes aún</p>
      </div>
    </div>

    <!-- Input de Mensaje -->
    <ChatInput @enviar="handleEnviarMensaje" :disabled="loadingEnvio" />

    <!-- Modal Editar Nombre -->
    <EditarNombreModal
      v-model="mostrarModalNombre"
      :cliente="cliente"
      :loading="loadingNombre"
      @guardar="handleGuardarNombre"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useClientesStore } from "@/stores/clientes";
import { useNotify } from "@/composables/useNotify";
import { getInitials, formatPhone } from "@/utils/formatters";
import ChatBubble from "./ChatBubble.vue";
import ChatInput from "./ChatInput.vue";
import EditarNombreModal from "./EditarNombreModal.vue";

defineEmits(["volver-lista"]);

const clientesStore = useClientesStore();
const notify = useNotify();

const messagesContainer = ref(null);
const loadingBot = ref(false);
const loadingEnvio = ref(false);
const loadingOlder = ref(false);
const loadingNombre = ref(false);
const isAtBottom = ref(true);
const previousScrollHeight = ref(0);
const mostrarModalNombre = ref(false);

const cliente = computed(() => clientesStore.clienteSeleccionado);
const mensajes = computed(() => clientesStore.mensajesActuales);
const loadingMensajes = computed(() => clientesStore.loadingMensajes);
const hasMore = computed(() => clientesStore.mensajesHasMore);

// Detectar scroll hacia arriba para cargar más mensajes
function handleScroll(event) {
  const container = event.target;
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;

  // Detectar si está al fondo
  isAtBottom.value = scrollHeight - scrollTop - clientHeight < 50;

  // Detectar scroll cerca del tope (100px) para cargar mensajes antiguos
  if (
    scrollTop < 100 &&
    hasMore.value &&
    !loadingOlder.value &&
    !loadingMensajes.value
  ) {
    cargarMensajesAntiguos();
  }
}

// Cargar mensajes antiguos (lazy loading)
async function cargarMensajesAntiguos() {
  if (!cliente.value || loadingOlder.value) return;

  loadingOlder.value = true;
  previousScrollHeight.value = messagesContainer.value?.scrollHeight || 0;

  const { success } = await clientesStore.cargarMensajesAntiguos();

  if (success) {
    // Mantener la posición del scroll después de agregar mensajes
    await nextTick();
    if (messagesContainer.value) {
      const newScrollHeight = messagesContainer.value.scrollHeight;
      const addedHeight = newScrollHeight - previousScrollHeight.value;
      messagesContainer.value.scrollTop += addedHeight;
    }
  }

  loadingOlder.value = false;
}

// Scroll al final solo cuando hay nuevos mensajes y ya estaba al fondo
watch(
  () => mensajes.value.length,
  async (newLength, oldLength) => {
    // Solo hacer scroll automático si:
    // 1. Es un mensaje nuevo (aumentó el length)
    // 2. Ya estábamos al fondo
    if (newLength > oldLength && isAtBottom.value) {
      await nextTick();
      scrollToBottom();
    }
  },
);

// Scroll cuando cambia el cliente seleccionado
watch(cliente, async (newCliente) => {
  if (newCliente) {
    await nextTick();
    scrollToBottom();
    isAtBottom.value = true;
  }
});

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

async function toggleBot() {
  if (!cliente.value) return;

  loadingBot.value = true;
  const nuevoPausado = !cliente.value.bot_pausado;

  const { success, error } = await clientesStore.toggleBotStatus(
    cliente.value.telefono,
    nuevoPausado,
  );

  loadingBot.value = false;

  if (success) {
    notify.success(nuevoPausado ? "Bot pausado" : "Bot activado");
  } else {
    notify.error(error || "Error al cambiar estado del bot");
  }
}

async function handleEnviarMensaje(texto) {
  if (!cliente.value || !texto.trim()) return;

  loadingEnvio.value = true;

  const { success, error } = await clientesStore.enviarMensaje(
    cliente.value.telefono,
    texto.trim(),
  );

  loadingEnvio.value = false;

  if (success) {
    notify.messageSent();
    await nextTick();
    scrollToBottom();
  } else {
    notify.error(error || "Error al enviar mensaje");
  }
}

function abrirModalNombre() {
  mostrarModalNombre.value = true;
}

async function handleGuardarNombre(nombre) {
  if (!cliente.value || !nombre.trim()) return;

  loadingNombre.value = true;

  const { success, error } = await clientesStore.actualizarNombreCliente(
    cliente.value.telefono,
    nombre.trim(),
  );

  loadingNombre.value = false;

  if (success) {
    notify.success("Nombre actualizado correctamente");
    mostrarModalNombre.value = false;
  } else {
    notify.error(error || "Error al actualizar el nombre");
  }
}
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-md border-l-4 p-4 md:p-6"
    :class="getBorderColor()"
  >
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4"
    >
      <div class="flex-1">
        <div class="flex items-center gap-2 flex-wrap mb-2">
          <h3 class="text-xl md:text-2xl font-bold text-gray-900">
            Pedido #{{ pedido.pedido_id }}
          </h3>

          <!-- Estado Badge -->
          <span
            class="px-2.5 py-1 rounded-full text-xs font-medium"
            :class="getEstadoBadgeClass()"
          >
            {{ getEstadoLabel() }}
          </span>

          <!-- Distancia -->
          <span
            class="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-mono font-semibold"
          >
            <MapPin :size="14" />
            {{
              pedido.distancia_km != null
                ? (+pedido.distancia_km).toFixed(1)
                : "0.0"
            }}
            km
          </span>
        </div>

        <p v-if="pedido.fecha_asignacion" class="text-xs text-gray-600">
          Asignado: {{ formatTime(pedido.fecha_asignacion) }}
        </p>
        <p
          v-if="pedido.fecha_en_camino"
          class="text-xs text-blue-600 font-medium"
        >
          En camino desde: {{ formatTime(pedido.fecha_en_camino) }}
        </p>
      </div>

      <!-- Total -->
      <div class="text-right">
        <p class="text-xs text-gray-600 mb-1">Total:</p>
        <p class="text-2xl md:text-3xl font-bold text-gray-900">
          {{ formatCurrency(pedido.total) }}
        </p>
      </div>
    </div>

    <!-- Cliente -->
    <div class="mb-4 p-3 bg-gray-50 rounded-lg">
      <div class="flex items-center gap-2 mb-2">
        <svg
          class="w-5 h-5 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clip-rule="evenodd"
          />
        </svg>
        <p class="font-medium text-gray-900">
          {{ pedido.cliente_nombre || "Cliente" }}
        </p>
      </div>

      <!-- Teléfono (clickeable para llamar) -->
      <a
        :href="`tel:${pedido.cliente_telefono}`"
        class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-2"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
          />
        </svg>
        {{ formatPhone(pedido.cliente_telefono) }}
      </a>

      <!-- Dirección -->
      <div class="flex items-start gap-2 text-sm text-gray-700">
        <svg
          class="w-4 h-4 mt-0.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="break-words">{{ pedido.direccion }}</span>
      </div>
    </div>

    <!-- Productos -->
    <div class="mb-4">
      <h4
        class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-1"
      >
        <ClipboardList :size="16" /> Productos:
      </h4>
      <div class="space-y-1.5">
        <div
          v-for="detalle in pedido.detalles"
          :key="detalle.id"
          class="flex items-center text-sm"
        >
          <span
            class="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full font-bold text-xs mr-2"
          >
            {{ detalle.cantidad }}
          </span>
          <span class="flex-1 text-gray-900">{{
            detalle.producto_nombre
          }}</span>
          <span class="text-gray-600 font-medium">{{
            formatCurrency(detalle.subtotal)
          }}</span>
        </div>
      </div>
    </div>

    <!-- Método de Pago -->
    <div
      v-if="pedido.metodo_pago"
      class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
    >
      <div class="flex items-center gap-2">
        <CreditCard :size="20" class="text-yellow-700" />
        <div class="flex-1">
          <p class="text-sm font-semibold text-gray-900">
            Pago: {{ capitalize(pedido.metodo_pago) }}
          </p>
          <p v-if="pedido.paga_con" class="text-xs text-gray-600 mt-1">
            Cliente paga con: {{ formatCurrency(pedido.paga_con) }}
          </p>
          <p
            v-if="vuelto > 0"
            class="text-xs font-medium text-orange-700 mt-1 flex items-center gap-1"
          >
            <Wallet :size="14" /> Vuelto: {{ formatCurrency(vuelto) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Botones de Acción -->
    <div class="space-y-2">
      <!-- Botón Navegar (siempre disponible) -->
      <a
        :href="linkNavegacion"
        target="_blank"
        class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Map :size="18" /> Navegar a Cliente
      </a>

      <!-- Botón Salir a Entregar (solo si está asignado) -->
      <button
        v-if="pedido.estado === ESTADO_PEDIDO.ASIGNADO"
        @click="enviarEstado(ESTADO_PEDIDO.EN_CAMINO)"
        :disabled="loading"
        class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <svg
          v-if="loading"
          class="animate-spin h-5 w-5 text-white"
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
        <Rocket v-if="!loading" :size="18" />
        <span>{{ loading ? "Actualizando..." : "Salir a Entregar" }}</span>
      </button>

      <!-- Botón Marcar Entregado (solo si está en camino) -->
      <button
        v-if="pedido.estado === ESTADO_PEDIDO.EN_CAMINO"
        @click="enviarEstado(ESTADO_PEDIDO.ENTREGADO)"
        :disabled="loading"
        class="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <svg
          v-if="loading"
          class="animate-spin h-5 w-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="current Color"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <Check v-if="!loading" :size="18" />
        <span>{{ loading ? "Actualizando..." : "Marcar Entregado" }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  MapPin,
  ClipboardList,
  CreditCard,
  Wallet,
  Map,
  Rocket,
  Check,
} from "lucide-vue-next";
import { ESTADO_PEDIDO, generarLinkNavegacion } from "@/utils/constants";
import {
  formatCurrency,
  formatTime,
  formatPhone,
  capitalize,
} from "@/utils/formatters";

const props = defineProps({
  pedido: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["cambiar-estado"]);

const linkNavegacion = computed(() => {
  if (props.pedido.cliente_latitud && props.pedido.cliente_longitud) {
    return generarLinkNavegacion(
      props.pedido.cliente_latitud,
      props.pedido.cliente_longitud,
    );
  }
  // Fallback: buscar dirección en Google Maps
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.pedido.direccion)}`;
});

const vuelto = computed(() => {
  if (props.pedido.paga_con && props.pedido.total) {
    return props.pedido.paga_con - props.pedido.total;
  }
  return 0;
});

function getBorderColor() {
  if (props.pedido.estado === ESTADO_PEDIDO.ASIGNADO)
    return "border-orange-500";
  if (props.pedido.estado === ESTADO_PEDIDO.EN_CAMINO) return "border-blue-500";
  return "border-gray-300";
}

function getEstadoBadgeClass() {
  if (props.pedido.estado === ESTADO_PEDIDO.ASIGNADO)
    return "bg-orange-100 text-orange-800";
  if (props.pedido.estado === ESTADO_PEDIDO.EN_CAMINO)
    return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
}

function getEstadoLabel() {
  if (props.pedido.estado === ESTADO_PEDIDO.ASIGNADO) return "ASIGNADO";
  if (props.pedido.estado === ESTADO_PEDIDO.EN_CAMINO) return "EN CAMINO";
  return props.pedido.estado?.toUpperCase();
}

function enviarEstado(nuevoEstado) {
  console.log("emitir estado", nuevoEstado);
  emit("cambiar-estado", {
    pedidoId: props.pedido.pedido_id,
    estado: nuevoEstado,
  });
}
</script>

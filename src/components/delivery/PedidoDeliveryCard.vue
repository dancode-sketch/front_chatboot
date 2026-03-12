<template>
  <div
    class="bg-white rounded-lg shadow-md border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow"
  >
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4"
    >
      <div class="flex-1">
        <div class="flex items-center gap-2 flex-wrap mb-2">
          <h3 class="text-xl md:text-2xl font-bold text-gray-900">
            Pedido #{{ pedido.id }}
          </h3>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"
            :class="
              pedido.tipo_entrega === TIPO_ENTREGA.DELIVERY
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            "
          >
            <Truck
              v-if="pedido.tipo_entrega === TIPO_ENTREGA.DELIVERY"
              :size="14"
            />
            <User v-else :size="14" />
            {{
              pedido.tipo_entrega === TIPO_ENTREGA.DELIVERY
                ? "Delivery"
                : "Recojo"
            }}
          </span>

          <!-- Distancia -->
          <span
            v-if="pedido.distancia_km != null"
            class="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-mono font-semibold"
          >
            <MapPin :size="12" /> {{ (+pedido.distancia_km).toFixed(1) }} km
          </span>
        </div>

        <p class="text-sm text-gray-600">
          {{ formatTime(pedido.fecha) }}
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

      <div class="flex items-center gap-2 text-sm text-gray-600">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
          />
        </svg>
        {{ formatPhone(pedido.cliente_telefono) }}
      </div>

      <div
        v-if="pedido.direccion_entrega"
        class="flex items-start gap-2 mt-2 text-sm text-gray-700"
      >
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
        <span class="break-words">{{ pedido.direccion_entrega }}</span>
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
            class="inline-flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-700 rounded-full font-bold text-xs mr-2"
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
      class="mb-4 text-sm text-gray-600 flex items-center gap-1"
    >
      <CreditCard :size="16" />
      <span class="font-medium">Pago:</span>
      <span class="ml-1">{{ capitalize(pedido.metodo_pago) }}</span>
    </div>

    <!-- Botón Asignar -->
    <button
      @click="$emit('asignar', pedido)"
      class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
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
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
      </svg>
      Asignar Motorizado
    </button>
  </div>
</template>

<script setup>
import {
  Truck,
  User,
  MapPin,
  ClipboardList,
  CreditCard,
} from "lucide-vue-next";
import { TIPO_ENTREGA } from "@/utils/constants";
import {
  formatCurrency,
  formatTime,
  formatPhone,
  capitalize,
} from "@/utils/formatters";

defineProps({
  pedido: {
    type: Object,
    required: true,
  },
});

defineEmits(["asignar"]);
</script>

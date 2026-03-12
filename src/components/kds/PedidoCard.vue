<template>
  <div
    class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
  >
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-gray-900">#{{ pedido.id }}</span>
          <span
            class="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
            :class="
              pedido.tipo_entrega === TIPO_ENTREGA.DELIVERY
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            "
          >
            <Truck v-if="pedido.tipo_entrega === TIPO_ENTREGA.DELIVERY" :size="14" />
            <User v-else :size="14" />
            {{
              pedido.tipo_entrega === TIPO_ENTREGA.DELIVERY
                ? "Delivery"
                : "Recojo"
            }}
          </span>
        </div>
        <span class="text-sm text-gray-600 font-medium">{{
          formatTime(pedido.fecha)
        }}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="p-4">
      <!-- Cliente -->
      <div class="mb-3">
        <p class="text-sm font-medium text-gray-900">
          {{ pedido.cliente_nombre || formatPhone(pedido.cliente_telefono) }}
        </p>
        <p
          v-if="
            pedido.tipo_entrega === TIPO_ENTREGA.DELIVERY &&
            pedido.direccion_entrega
          "
          class="text-xs text-gray-600 mt-1 truncate flex items-center gap-1"
          :title="pedido.direccion_entrega"
        >
          <MapPin :size="12" /> {{ pedido.direccion_entrega }}
        </p>
      </div>

      <!-- Productos - SECCIÓN DESTACADA PARA EL COCINERO -->
      <div class="mb-3">
        <div class="flex items-center mb-2">
          <span
            class="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1"
            ><ClipboardList :size="14" /> Para Preparar:</span
          >
        </div>
        <div
          class="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-3 space-y-2"
        >
          <div
            v-for="detalle in pedido.detalles"
            :key="detalle.id"
            class="flex items-center"
          >
            <span
              class="inline-flex items-center justify-center w-8 h-8 bg-yellow-600 text-white rounded-full font-bold text-sm mr-3"
            >
              {{ detalle.cantidad }}
            </span>
            <span class="text-base font-semibold text-gray-900">{{
              detalle.producto_nombre
            }}</span>
          </div>
        </div>
      </div>

      <!-- Método de Pago -->
      <div
        v-if="pedido.metodo_pago"
        class="mb-3 text-xs text-gray-600 flex items-center gap-1"
      >
        <component :is="getMetodoPagoIcon(pedido.metodo_pago)" :size="14" />
        <span>{{ capitalize(pedido.metodo_pago) }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 bg-gray-50 border-t border-gray-200">
      <!-- Total -->
      <div class="mb-3">
        <p class="text-xs text-gray-600 mb-1">Total:</p>
        <p class="text-2xl font-bold text-gray-900">
          {{ formatCurrency(pedido.total) }}
        </p>
      </div>

      <!-- Botones de Acción -->
      <div class="flex gap-2">
        <template v-if="pedido.estado === ESTADO_PEDIDO.PENDIENTE">
          <button
            @click="cambiarEstado(ESTADO_PEDIDO.PREPARANDO)"
            :disabled="loading"
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Iniciar Preparación →
          </button>
        </template>

        <template v-else-if="pedido.estado === ESTADO_PEDIDO.PREPARANDO">
          <button
            @click="cambiarEstado(ESTADO_PEDIDO.PENDIENTE)"
            :disabled="loading"
            class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            ← Regresar
          </button>
          <button
            @click="cambiarEstado(ESTADO_PEDIDO.LISTO)"
            :disabled="loading"
            class="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Marcar Listo →
          </button>
        </template>

        <template v-else-if="pedido.estado === ESTADO_PEDIDO.LISTO">
          <button
            @click="cambiarEstado(ESTADO_PEDIDO.PREPARANDO)"
            :disabled="loading"
            class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            ← Regresar
          </button>
          <button
            @click="cambiarEstado(ESTADO_PEDIDO.ENTREGADO)"
            :disabled="loading"
            class="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Entregado ✓
          </button>
        </template>

        <template v-else-if="pedido.estado === ESTADO_PEDIDO.ENTREGADO">
          <div class="flex-1 text-center text-sm text-gray-500 py-2">
            ✓ Completado
          </div>
        </template>

        <template v-else-if="pedido.estado === ESTADO_PEDIDO.CANCELADO">
          <div class="flex-1 text-center text-sm text-red-500 py-2">
            ✗ Cancelado
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Swal from "sweetalert2";
import { Truck, User, MapPin, ClipboardList, CircleDollarSign, Smartphone, CreditCard, Banknote } from 'lucide-vue-next';
import { ESTADO_PEDIDO, TIPO_ENTREGA } from "@/utils/constants";
import {
  formatTime,
  formatCurrency,
  formatPhone,
  capitalize,
} from "@/utils/formatters";

const props = defineProps({
  pedido: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["actualizar-estado"]);

const loading = ref(false);

async function cambiarEstado(nuevoEstado) {
  // Si es delivery y se intenta marcar como entregado, pedir confirmación
  if (props.pedido.tipo_entrega === TIPO_ENTREGA.DELIVERY && nuevoEstado === ESTADO_PEDIDO.ENTREGADO) {
    const result = await Swal.fire({
      title: '⚠️ ¿Está seguro?',
      html: '<p>¿Desea marcar como <strong>ENTREGADO</strong> un pedido delivery?</p>' +
            '<p class="text-sm text-gray-600 mt-2">⚠️ El motorizado ya no podrá ver este pedido</p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, marcar entregado',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });
    
    if (!result.isConfirmed) {
      return; // No hacer nada si cancela
    }
  }
  
  emit("actualizar-estado", {
    pedidoId: props.pedido.id,
    nuevoEstado,
  });
}

function getMetodoPagoIcon(metodo) {
  const iconos = {
    efectivo: CircleDollarSign,
    yape: Smartphone,
    plin: Smartphone,
    transferencia: CreditCard,
    tarjeta: CreditCard,
  };
  return iconos[metodo.toLowerCase()] || Banknote;
}
</script>

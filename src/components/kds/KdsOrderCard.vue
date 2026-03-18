<template>
  <div
    :class="['bg-white rounded-lg shadow p-4 mb-4 border', borderColorClass]"
  >
    <div class="flex items-start justify-between mb-3">
      <div>
        <h3 class="font-bold text-lg">
          <span class="uppercase">{{ tipoLabel }}</span>
          <span v-if="mesaLabel" class="capitalize">
            - Mesa {{ mesaLabel }}</span
          >
          <span class="text-sm font-normal text-gray-500 ml-2">
            Pedido #{{ pedido.id }}
          </span>
        </h3>
        <p v-if="contactoLabel" class="text-xs text-gray-500 mt-0.5">
          Contacto: {{ contactoLabel }}
        </p>
      </div>

      <label
        class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          :checked="allChecked"
          @change="toggleAll"
          class="w-5 h-5 accent-green-500"
          :disabled="!hasItems"
        />
        <span>Todo</span>
      </label>
    </div>
    <TransitionGroup name="fade" tag="div">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center mb-2 cursor-pointer"
        :class="{
          'line-through text-gray-400': item.estado_cocina === 'LISTO',
          'text-gray-900': item.estado_cocina !== 'LISTO',
        }"
        @click="toggleEstado(item)"
      >
        <input
          type="checkbox"
          :checked="item.estado_cocina === 'LISTO'"
          class="w-6 h-6 mr-3 accent-green-500"
          readonly
        />
        <span class="font-bold mr-2">{{ item.cantidad }}x</span>
        <span class="flex-1">
          {{ item.nombre }}
          <span
            v-if="item.estado_cocina"
            class="text-[10px] font-semibold ml-2 px-2 py-0.5 rounded-full"
            :class="{
              'bg-yellow-200 text-yellow-800':
                item.estado_cocina === 'PENDIENTE',
              'bg-blue-200 text-blue-800': item.estado_cocina === 'PREPARANDO',
              'bg-green-200 text-green-800': item.estado_cocina === 'LISTO',
            }"
          >
            {{ item.estado_cocina }}
          </span>
          <span
            v-if="
              item.nuevo_en_kds ||
              (item.estado_cocina === 'PENDIENTE' &&
                item.fecha_envio_cocina === null)
            "
            class="text-[10px] font-semibold ml-2 px-2 py-0.5 rounded-full bg-indigo-600 text-white"
          >
            NUEVO
          </span>
        </span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { useOrderStore } from "@/stores/order";

const props = defineProps({
  pedido: {
    type: Object,
    required: true,
  },
  color: {
    type: String,
    default: "gray",
  },
});
const orderStore = useOrderStore();

const items = computed(() =>
  (props.pedido.items || props.pedido.detalles || []).map((i) => ({
    ...i,
    id: i.id || i.item_id,
    nombre: i.nombre || i.producto_nombre,
  })),
);

const mesaLabel = computed(
  () => props.pedido.numero_mesa || props.pedido.mesa || null,
);

const contactoLabel = computed(() => props.pedido.nombre_contacto || null);

const tipoLabel = computed(() => {
  const t = (props.pedido.tipo_entrega || props.pedido.tipo || "")
    .toString()
    .toUpperCase();
  const map = {
    MESA: "Mesa",
    DELIVERY: "Delivery",
    RECOJO: "Recojo",
    PRESENCIAL: "Presencial",
  };
  return map[t] || (t ? t : "Pedido");
});

const hasItems = computed(() => items.value.length > 0);
const allChecked = computed(
  () => hasItems.value && items.value.every((i) => i.estado_cocina === "LISTO"),
);

const borderColorClass = computed(() => {
  const map = {
    yellow: "border-yellow-200",
    blue: "border-blue-200",
    green: "border-green-200",
    orange: "border-orange-200",
    purple: "border-purple-200",
    gray: "border-gray-200",
    red: "border-red-200",
  };
  return map[props.color] || map.gray;
});

// Debug: ver qué datos está recibiendo el KDS
onMounted(() => {
  console.log("KDS carta montada", {
    pedido: props.pedido,
    items: items.value,
  });
});

watch(items, (value) => {
  console.log("KDS items actualizados", value);
});

async function toggleEstado(item) {
  if (item.estado_cocina === "PENDIENTE") {
    await orderStore.marcarItemEstado(props.pedido.id, item.id, "PREPARANDO");
  } else if (item.estado_cocina === "PREPARANDO") {
    await orderStore.marcarItemEstado(props.pedido.id, item.id, "LISTO");
  }
  // Si ya está LISTO, no hacemos nada.
}

async function toggleAll() {
  if (!hasItems.value) return;

  // If all items are already LISTO, uncheck will reset them to PENDIENTE.
  if (allChecked.value) {
    await Promise.all(
      items.value.map((item) =>
        orderStore.marcarItemEstado(props.pedido.id, item.id, "PENDIENTE"),
      ),
    );
    return;
  }

  // Otherwise, advance each item by one step in the workflow:
  // PENDIENTE -> PREPARANDO -> LISTO.
  const itemsToUpdate = items.value
    .map((item) => {
      if (item.estado_cocina === "PENDIENTE")
        return { item, next: "PREPARANDO" };
      if (item.estado_cocina === "PREPARANDO") return { item, next: "LISTO" };
      return null; // already LISTO
    })
    .filter(Boolean);

  await Promise.all(
    itemsToUpdate.map(({ item, next }) =>
      orderStore.marcarItemEstado(props.pedido.id, item.id, next),
    ),
  );
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

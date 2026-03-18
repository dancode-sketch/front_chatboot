<template>
  <button
    type="button"
    class="group relative w-full aspect-square rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500"
    :class="cardClasses"
    @click="onClick"
  >
    <div class="flex flex-col h-full justify-between">
      <div class="flex items-start justify-between">
        <span class="text-sm font-semibold tracking-wide">{{
          mesa.numero_nombre
        }}</span>
        <span class="text-xs font-semibold text-gray-500"
          >{{ mesa.capacidad || 0 }}👤</span
        >
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-semibold tracking-wide text-gray-600">
          {{ estadoLabel }}
        </span>
        <span v-if="timeLabel" class="text-xs text-gray-500">{{
          timeLabel
        }}</span>
      </div>

      <div class="mt-2 flex items-center justify-between">
        <span class="text-xs text-gray-400">ID {{ mesa.id }}</span>
        <span class="text-xs text-gray-400">{{ zoneLabel }}</span>
      </div>
    </div>

    <span
      v-if="mesaEstado === 'PAGANDO'"
      class="absolute inset-0 rounded-xl border-2 border-amber-500 opacity-70 animate-pulse"
    />
  </button>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  mesa: {
    type: Object,
    required: true,
  },
  now: {
    type: Number,
    default: () => Date.now(),
  },
  zoneLabel: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["click"]);
const router = useRouter();

const mesaEstado = computed(() => {
  // Apoyar múltiples nombres de campo que el backend pueda usar.
  const raw =
    props.mesa.estado_mesa || props.mesa.estado || props.mesa.estadoMesa || "";
  return raw.toString().toUpperCase();
});

const estadoLabel = computed(() => {
  const estado = mesaEstado.value;
  if (estado === "LIBRE") return "Libre";
  if (estado === "OCUPADA") return "Ocupada";
  if (estado === "PAGANDO") return "Pagando";
  return estado || "—";
});

const cardClasses = computed(() => {
  const estado = mesaEstado.value;
  if (estado === "LIBRE") {
    return "bg-emerald-50 border-2 border-emerald-500 text-emerald-800 hover:bg-emerald-100";
  }
  if (estado === "OCUPADA") {
    return "bg-rose-50 border-2 border-rose-500 text-rose-800 hover:bg-rose-100";
  }
  if (estado === "PAGANDO") {
    return "bg-amber-100 border-2 border-amber-500 text-amber-800 hover:bg-amber-200";
  }
  return "bg-white border border-gray-200 hover:bg-gray-50";
});

const timeLabel = computed(() => {
  const estado = (props.mesa.estado_mesa || "").toString().toUpperCase();
  if (estado !== "OCUPADA" && estado !== "PAGANDO") return "";

  const timeKeys = [
    "pedido_activo_creado_at",
    "pedido_activo_created_at",
    "pedido_activo_started_at",
    "abierto_desde",
    "opened_at",
    "started_at",
  ];

  let t = null;
  for (const key of timeKeys) {
    if (props.mesa[key]) {
      t = new Date(props.mesa[key]);
      break;
    }
  }

  if (!t || Number.isNaN(t.getTime())) return "";

  const diffMs = props.now - t.getTime();
  if (diffMs < 0) return "";

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
});

function onClick() {
  const estado = mesaEstado.value;
  if (estado === "LIBRE") {
    router.push({
      path: "/pos/nueva-orden",
      query: {
        mesa_id: props.mesa.id,
        mesa_nombre: props.mesa.numero_nombre,
      },
    });
  } else if (estado === "OCUPADA" || estado === "PAGANDO") {
    const pedidoId =
      props.mesa.pedido_activo_id ||
      props.mesa.pedido_id ||
      props.mesa.pedido ||
      props.mesa.orden_id;
    if (pedidoId) {
      router.push({ name: "OrdenActiva", params: { id: pedidoId } });
    }
  }
  emit("click");
}
</script>

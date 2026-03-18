<template>
  <div class="h-full flex flex-col lg:flex-row">
    <div class="absolute top-4 right-4 z-20">
      <button
        class="px-3 py-2 bg-gray-200 rounded shadow"
        @click="$emit('close')"
      >
        Cerrar
      </button>
    </div>
    <!-- paso 1: tipo de servicio -->
    <div v-if="step === 'tipo'" class="w-full bg-gray-100 p-4 flex flex-col">
      <h2 class="text-xl font-bold mb-4">Nuevo pedido</h2>
      <div class="mb-4 flex flex-wrap gap-2">
        <button
          v-for="t in tipos"
          :key="t"
          @click="selectTipo(t)"
          :class="[
            'px-4 py-2 rounded-lg font-semibold',
            tipo === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-700',
          ]"
        >
          {{ t }}
        </button>
      </div>

      <div v-if="tipo === 'MESA'" class="mb-4 space-y-2">
        <input
          v-model="form.numero_mesa"
          placeholder="Número de mesa"
          class="w-full border rounded px-3 py-2"
        />
        <textarea
          v-model="form.comentario_general"
          placeholder="Comentario general (opcional)"
          class="w-full border rounded px-3 py-2 resize-none"
          rows="3"
        />
      </div>

      <div v-if="tipo === 'RECOJO'" class="mb-4 space-y-2">
        <input
          v-model="form.nombre_contacto"
          placeholder="Nombre del contacto"
          class="w-full border rounded px-3 py-2"
        />
        <textarea
          v-model="form.comentario_general"
          placeholder="Comentario general (opcional)"
          class="w-full border rounded px-3 py-2 resize-none"
          rows="3"
        />
      </div>

      <div v-if="tipo === 'DELIVERY'" class="mb-4 space-y-2">
        <input
          v-model="form.nombre_contacto"
          placeholder="Nombre del contacto"
          class="w-full border rounded px-3 py-2"
        />
        <input
          v-model="form.direccion"
          placeholder="Dirección"
          class="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          v-model.number="form.costo_delivery"
          placeholder="Costo delivery"
          class="w-full border rounded px-3 py-2"
        />
        <textarea
          v-model="form.comentario_general"
          placeholder="Comentario general (opcional)"
          class="w-full border rounded px-3 py-2 resize-none"
          rows="3"
        />
      </div>

      <div v-if="tipo === 'PRESENCIAL'" class="mb-4">
        <textarea
          v-model="form.comentario_general"
          placeholder="Comentario general (opcional)"
          class="w-full border rounded px-3 py-2 resize-none"
          rows="3"
        />
      </div>

      <div class="mt-auto flex justify-end">
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
          :disabled="!canContinueTipo"
          @click="goToProducts()"
        >
          Continuar
        </button>
      </div>
    </div>

    <div v-else class="w-full flex flex-col lg:flex-row">
      <OpenRegisterModal
        v-model="needsOpenCajaModal"
        :loading="cajaStore.loading"
        @abrir="
          async (monto) => {
            await cajaStore.abrirCaja(monto);
            needsOpenCajaModal.value = false;
          }
        "
      />

      <!-- pestañas móvil -->
      <div v-if="!isDesktop" class="flex gap-2 p-4 bg-gray-100">
        <button
          @click="activeTab = 'products'"
          :class="[
            'flex-1 py-2 rounded-lg font-semibold text-sm',
            activeTab === 'products'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700',
          ]"
        >
          Productos
        </button>
        <button
          @click="activeTab = 'cart'"
          :class="[
            'flex-1 py-2 rounded-lg font-semibold text-sm',
            activeTab === 'cart'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700',
          ]"
        >
          Carrito
        </button>
      </div>

      <!-- izquierdo: menú -->
      <div
        v-show="showProducts"
        class="w-full lg:w-3/5 bg-gray-100 p-4 flex flex-col"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Tipo de servicio</div>
            <div class="font-semibold">{{ tipo }}</div>
          </div>
          <button
            class="text-sm text-blue-600 hover:underline"
            @click="step = 'tipo'"
          >
            Cambiar
          </button>
        </div>

        <!-- categorías -->
        <div class="mb-4 overflow-x-auto">
          <div class="flex gap-2 whitespace-nowrap">
            <button
              class="px-3 py-2 rounded-full text-sm font-semibold"
              :class="{
                'bg-blue-600 text-white': !selectedCategoryId,
                'bg-white text-gray-700 border border-gray-200':
                  selectedCategoryId,
              }"
              @click="selectedCategoryId = null"
            >
              Todas
            </button>
            <button
              v-for="cat in categoriesStore.categories"
              :key="cat.id"
              class="px-3 py-2 rounded-full text-sm font-semibold"
              :class="{
                'bg-blue-600 text-white': selectedCategoryId === cat.id,
                'bg-white text-gray-700 border border-gray-200':
                  selectedCategoryId !== cat.id,
              }"
              @click="selectedCategoryId = cat.id"
            >
              {{ cat.nombre }}
            </button>
          </div>
        </div>

        <!-- buscador -->
        <input
          v-model="search"
          placeholder="Buscar producto..."
          class="mb-4 w-full border rounded px-3 py-2"
        />
        <!-- grilla productos -->
        <div
          class="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div
            v-for="prod in filteredProducts"
            :key="prod.id"
            class="bg-white p-3 rounded shadow cursor-pointer hover:bg-blue-50"
            @click="addItem(prod)"
          >
            <div class="font-medium">{{ prod.nombre }}</div>
            <div class="text-sm text-gray-600">
              S/ {{ (Number(prod.precio) || 0).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- derecho: carrito -->
      <div
        v-show="showCart"
        class="w-full lg:w-2/5 bg-white p-4 flex flex-col mt-4 lg:mt-0"
      >
        <h2 class="text-lg font-bold mb-4">Comanda</h2>
        <div class="flex-1 overflow-y-auto space-y-2">
          <div
            v-for="(item, idx) in carrito"
            :key="idx"
            class="border rounded p-2 flex flex-col"
          >
            <div class="flex justify-between items-center">
              <div class="font-medium">
                {{ item.producto_nombre }}
                <span
                  v-if="item.enviado"
                  class="text-xs text-green-600 font-semibold ml-2"
                >
                  (enviado)
                </span>
              </div>
              <div class="flex items-center space-x-1">
                <button
                  @click="decrement(idx)"
                  class="px-1"
                  :disabled="itemBloqueado(item)"
                >
                  -
                </button>
                <span>{{ item.cantidad }}</span>
                <button
                  @click="increment(idx)"
                  class="px-1"
                  :disabled="itemBloqueado(item)"
                >
                  +
                </button>
              </div>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              S/ {{ item.subtotal.toFixed(2) }}
            </div>
            <div>
              <button
                class="text-xs text-blue-600 mt-1"
                @click="toggleNote(idx)"
                :disabled="itemBloqueado(item)"
              >
                Añadir nota
              </button>
              <div v-if="item.showNote" class="mt-1">
                <input
                  v-model="item.comentario"
                  placeholder="Comentario"
                  class="w-full border rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <label class="text-sm font-semibold mb-1 block"
            >Comentario general</label
          >
          <textarea
            v-model="form.comentario_general"
            placeholder="Comentario general (opcional)"
            class="w-full border rounded px-3 py-2 resize-none"
            rows="3"
          />
        </div>

        <div class="mt-4">
          <div class="flex justify-between text-sm">
            <span>Subtotal</span><span>S/ {{ subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="form.costo_delivery" class="flex justify-between text-sm">
            <span>Delivery</span
            ><span>S/ {{ form.costo_delivery.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between font-bold text-lg mt-2">
            <span>Total</span><span>S/ {{ total.toFixed(2) }}</span>
          </div>
        </div>
        <div class="mt-4">
          <select
            v-model="form.metodo_pago"
            class="w-full border rounded px-3 py-2 mb-2"
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
          </select>
          <button
            v-if="!isEditing"
            class="w-full bg-green-600 text-white py-2 rounded font-bold disabled:opacity-50"
            :disabled="!canSubmit || loading"
            @click="confirmar"
          >
            Confirmar Pedido (S/ {{ total.toFixed(2) }})
          </button>

          <div v-else class="space-y-2">
            <button
              class="w-full bg-blue-600 text-white py-2 rounded font-bold"
              @click="enviarCocina"
              :disabled="nuevosItems.length === 0"
            >
              Enviar a Cocina
            </button>
            <button
              class="w-full bg-gray-700 text-white py-2 rounded font-bold"
              @click="preCuenta"
            >
              🖨️ Pre-Cuenta
            </button>
            <button
              class="w-full bg-green-600 text-white py-2 rounded font-bold"
              @click="showCobro = true"
            >
              💰 Cobrar (Total: S/ {{ total.toFixed(2) }})
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { usePedidosStore } from "@/stores/pedidos";
import { useCategoriesStore } from "@/stores/categories";
import { useCajaStore } from "@/stores/caja";
import { useAuthStore } from "@/stores/auth";
import { useNotify } from "@/composables/useNotify";
import OpenRegisterModal from "@/components/caja/OpenRegisterModal.vue";

const props = defineProps({
  initialOrder: {
    type: Object,
    default: null,
  },
});

const pedidosStore = usePedidosStore();
const notify = useNotify();
const cajaStore = useCajaStore();
const authStore = useAuthStore();
const loading = ref(false);
const needsOpenCajaModal = ref(false);

// Si el pedido se crea en esta vista, guardamos su id para usar en acciones posteriores (items, precuenta, etc.)
const createdOrderId = ref(null);

const orderId = computed(
  () => props.initialOrder?.id || createdOrderId.value || null,
);

const tipos = ["DELIVERY", "RECOJO", "MESA", "PRESENCIAL"];
const tipo = ref("DELIVERY");
const step = ref("tipo");
const activeTab = ref("products");
const isDesktop = ref(false);
const search = ref("");

const products = ref([]);

const categoriesStore = useCategoriesStore();
const selectedCategoryId = ref(null);

// fetch products desde backend
import { apiHelpers } from "@/composables/useApi";
import { ENDPOINTS } from "@/utils/constants";

async function loadProducts() {
  const { data, error } = await apiHelpers.get(ENDPOINTS.PRODUCTS, {
    params: { activos: true },
  });
  if (error) {
    console.error("Error cargando productos:", error);
  } else if (data) {
    products.value = data.map((p) => ({
      ...p,
      precio: Number(p.precio) || 0,
    }));
  }
}

const updateIsDesktop = () => {
  isDesktop.value = window.matchMedia("(min-width: 1024px)").matches;
  if (isDesktop.value) activeTab.value = "products";
};

const canContinueTipo = computed(() => {
  if (tipo.value === "MESA") return !!form.value.numero_mesa.trim();
  if (tipo.value === "DELIVERY") return !!form.value.direccion?.trim();
  if (tipo.value === "RECOJO") return !!form.value.nombre_contacto?.trim();
  return true;
});

const showProducts = computed(
  () =>
    step.value === "productos" &&
    (isDesktop.value || activeTab.value === "products"),
);
const showCart = computed(
  () =>
    step.value === "productos" &&
    (isDesktop.value || activeTab.value === "cart"),
);

const mql = window.matchMedia("(min-width: 1024px)");
const handler = (e) => {
  isDesktop.value = e.matches;
  if (e.matches) activeTab.value = "products";
};

onBeforeUnmount(() => {
  mql.removeEventListener?.("change", handler);
  mql.removeListener?.(handler);
});

onMounted(async () => {
  mql.addEventListener?.("change", handler);
  mql.addListener?.(handler);

  await categoriesStore.fetchCategories();
  await cajaStore.verificarEstadoCaja();
  loadProducts();
  updateIsDesktop();

  // Si es cajero y la caja está cerrada, forzamos apertura antes de permitir cobrar
  if (authStore.hasAnyRole(["CAJERO"]) && !cajaStore.isCajaAbierta) {
    needsOpenCajaModal.value = true;
  }
});

const form = ref({
  cliente_id: 0,
  detalles: [],
  total: 0,
  tipo_entrega: "DELIVERY",
  direccion: null,
  metodo_pago: "efectivo",
  costo_delivery: 0,
  distancia_km: 0,
  cliente_latitud: null,
  cliente_longitud: null,
  comentario_general: "",
  numero_mesa: "",
  nombre_contacto: "",
  turno_caja_id: null,
});

defineEmits(["close"]);

const carrito = ref([]);

const showCobro = ref(false);

function loadOrder(order) {
  if (!order) return;
  step.value = "productos";
  tipo.value = order.tipo_entrega || tipo.value;
  form.value.tipo_entrega = order.tipo_entrega || form.value.tipo_entrega;
  form.value.numero_mesa = order.numero_mesa || "";
  form.value.nombre_contacto = order.nombre_contacto || "";
  form.value.comentario_general = order.comentario_general || "";
  form.value.direccion = order.direccion_entrega || null;
  form.value.costo_delivery = Number(order.costo_delivery) || 0;
  form.value.turno_caja_id = order.turno_caja_id || null;
  carrito.value = (order.detalles || []).map((d) => {
    const estado = d.estado_cocina || "PENDIENTE";
    return {
      id: d.id || d.pedido_detalle_id || null,
      producto_id: d.producto_id,
      producto_nombre: d.producto_nombre,
      cantidad: d.cantidad,
      precio_unitario: Number(d.precio_unitario) || 0,
      subtotal: Number(d.subtotal) || 0,
      comentario: d.comentario || "",
      estado_cocina: estado,
      // Los ítems que vienen del backend ya están creados; no deben volver a enviarse al “Enviar a cocina”
      enviado: true,
      nuevo: false,
      showNote: false,
    };
  });
}

function resetForm() {
  step.value = "tipo";
  tipo.value = "DELIVERY";
  activeTab.value = "products";
  carrito.value = [];
  showCobro.value = false;
  form.value = {
    cliente_id: 0,
    detalles: [],
    total: 0,
    tipo_entrega: "DELIVERY",
    direccion: null,
    metodo_pago: "efectivo",
    costo_delivery: 0,
    distancia_km: 0,
    cliente_latitud: null,
    cliente_longitud: null,
    comentario_general: "",
    numero_mesa: "",
    nombre_contacto: "",
    turno_caja_id: null,
  };
}

watch(
  () => props.initialOrder,
  (order) => {
    if (order) {
      loadOrder(order);
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

const filteredProducts = computed(() => {
  const filtered = products.value.filter((p) =>
    p.nombre.toLowerCase().includes(search.value.toLowerCase()),
  );

  if (!selectedCategoryId.value) return filtered;
  return filtered.filter((p) => p.categoria_id === selectedCategoryId.value);
});

const subtotal = computed(() =>
  carrito.value.reduce((acc, i) => acc + i.subtotal, 0),
);
const total = computed(() => subtotal.value + (form.value.costo_delivery || 0));

const isEditing = computed(() => !!orderId.value);

const canSubmit = computed(() => {
  if (carrito.value.length === 0) return false;
  if (tipo.value === "MESA" && !form.value.numero_mesa.trim()) return false;
  if (tipo.value === "DELIVERY" && !form.value.direccion?.trim()) return false;
  if (tipo.value === "RECOJO" && !form.value.nombre_contacto?.trim())
    return false;
  return true;
});

const nuevosItems = computed(() =>
  carrito.value.filter((i) => i.estado_cocina === "PENDIENTE" && i.nuevo),
);

function selectTipo(t) {
  tipo.value = t;
  form.value.tipo_entrega = t;
  // limpiar campos específicos
  if (t !== "DELIVERY")
    ((form.value.direccion = null), (form.value.costo_delivery = 0));
}

function goToProducts() {
  if (!canContinueTipo.value) return;
  step.value = "productos";
  activeTab.value = "products";
  selectedCategoryId.value = null;
  search.value = "";
}

function addItem(prod) {
  // Si ya hay un ítem pendiente, le sumamos cantidad.
  // Si el ítem ya está en preparación/listo, agregamos uno nuevo para que pueda ir como "pendiente"
  const existingPending = carrito.value.find(
    (i) => i.producto_id === prod.id && i.estado_cocina === "PENDIENTE",
  );

  if (existingPending) {
    increment(carrito.value.indexOf(existingPending));
  } else {
    carrito.value.push({
      producto_id: prod.id,
      producto_nombre: prod.nombre,
      cantidad: 1,
      precio_unitario: prod.precio,
      subtotal: prod.precio,
      comentario: "",
      estado_cocina: "PENDIENTE",
      enviado: false,
      nuevo: true,
      showNote: false,
    });
  }

  notify.success(`Agregado: ${prod.nombre}`);
}

function itemBloqueado(item) {
  // No permitir modificar un item que ya se envió a cocina (aunque el backend no lo haya marcado)
  if (item.enviado) return true;
  return ["PREPARANDO", "LISTO", "ENTREGADO"].includes(item.estado_cocina);
}

function increment(idx) {
  const i = carrito.value[idx];
  if (itemBloqueado(i)) return;
  i.cantidad++;
  i.subtotal = i.cantidad * i.precio_unitario;
}
function decrement(idx) {
  const i = carrito.value[idx];
  if (itemBloqueado(i)) return;
  if (i.cantidad > 1) {
    i.cantidad--;
    i.subtotal = i.cantidad * i.precio_unitario;
  } else {
    carrito.value.splice(idx, 1);
  }
}
function toggleNote(idx) {
  carrito.value[idx].showNote = !carrito.value[idx].showNote;
}

async function confirmar() {
  if (!canSubmit.value) return;
  loading.value = true;

  // Aseguramos que el pedido tenga el turno de caja actual (si existe)
  form.value.turno_caja_id = cajaStore.resumenActual?.turno_id || null;

  form.value.detalles = carrito.value.map((i) => ({
    producto_id: i.producto_id,
    producto_nombre: i.producto_nombre,
    cantidad: i.cantidad,
    precio_unitario: i.precio_unitario,
    subtotal: i.subtotal,
    comentario: i.comentario,
  }));
  form.value.total = total.value;

  const { success, error, data } = await pedidosStore.createPedido({
    ...form.value,
  });
  loading.value = false;
  if (success) {
    createdOrderId.value = data?.id || createdOrderId.value;
    notify.success("Pedido creado correctamente");
    carrito.value = [];
    form.value.comentario_general = "";
    form.value.numero_mesa = "";
    form.value.nombre_contacto = "";
    form.value.total = 0;
  } else {
    notify.error(error || "Error al crear pedido");
  }
}

async function enviarCocina() {
  // Solo consideramos ítems que siguen en PENDIENTE y que fueron creados localmente (nuevos)
  const pendientes = carrito.value.filter(
    (i) => i.estado_cocina === "PENDIENTE" && i.nuevo,
  );

  if (pendientes.length === 0) {
    notify.info("No hay items nuevos para enviar a cocina");
    return;
  }

  const toCreate = pendientes.filter((i) => !i.id);
  const toPatch = pendientes.filter((i) => i.id);

  loading.value = true;

  // 1) Crear ítems nuevos en el pedido (ronda 2)
  if (toCreate.length > 0) {
    const payload = toCreate.map((i) => ({
      producto_nombre: i.producto_nombre,
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario,
      subtotal: i.subtotal,
      comentario: i.comentario,
    }));

    const currentOrderId = orderId.value;
    if (!currentOrderId) {
      loading.value = false;
      notify.error("No hay un pedido válido para enviar ítems.");
      return;
    }

    const { success, data, error } = await pedidosStore.agregarItems(
      currentOrderId,
      payload,
    );

    if (!success) {
      loading.value = false;
      notify.error(
        error?.message ||
          (Array.isArray(error)
            ? error.map((e) => e.msg).join(", ")
            : "Error agregando items"),
      );
      return;
    }

    // Si el backend devuelve los ítems creados, asignamos ids y los marcamos como enviados
    if (data?.items && Array.isArray(data.items)) {
      data.items.forEach((created) => {
        const local = carrito.value.find(
          (i) =>
            i.producto_nombre === created.producto_nombre &&
            Number(i.cantidad) === Number(created.cantidad) &&
            !i.enviado,
        );
        if (local) {
          local.id = created.id || local.id;
          local.estado_cocina = created.estado_cocina || "PREPARANDO";
          local.enviado = true;
          local.nuevo = false;
        }
      });

      // Asegurarnos de que los items que no fueron emparejados no queden "pendientes"
      // (esto evita que un ítem ya enviado se vuelva a enviar si el match falló)
      toCreate.forEach((item) => {
        if (!item.enviado) {
          item.estado_cocina = "PREPARANDO";
          item.enviado = true;
          item.nuevo = false;
        }
      });
    } else if (data?.pedido?.detalles) {
      // si el backend devuelve el pedido completo, recargamos el estado local
      loadOrder(data.pedido);
    } else {
      // fallback: marcar manualmente los creados como enviados
      toCreate.forEach((item) => {
        item.estado_cocina = "PREPARANDO";
        item.enviado = true;
        item.nuevo = false;
      });
    }
  }

  // 2) Para ítems existentes, marcar como PREPARANDO (enviar a cocina)
  for (const item of toPatch) {
    const currentOrderId = orderId.value;
    if (!currentOrderId) {
      continue;
    }
    const { success, error } = await pedidosStore.actualizarEstadoItem(
      currentOrderId,
      item.id,
      "PREPARANDO",
    );

    if (!success) {
      console.error("Error al actualizar estado de item", error);
      continue;
    }

    item.estado_cocina = "PREPARANDO";
    item.enviado = true;
  }

  loading.value = false;
  notify.success("Items enviados a cocina");
}

async function preCuenta() {
  const currentOrderId = orderId.value;
  if (!currentOrderId) return;
  const res = await pedidosStore.getPreCuenta(currentOrderId);
  notify.success("Pre-cuenta generada");
  // mostrar modal / alerta para visualizar ticket
  alert(res.ticket || "Pre-cuenta generada");
}
</script>

<style scoped>
/* optionally add specific styles */
</style>

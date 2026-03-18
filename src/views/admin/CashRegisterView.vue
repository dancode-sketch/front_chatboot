<template>
  <div class="p-4">
    <div
      class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6"
    >
      <div>
        <h1 class="text-2xl font-bold">Gestión de Caja</h1>
        <p class="text-sm text-gray-600 mt-1">
          Controla apertura, egresos y cierre de turno.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          class="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition"
          @click="showEgresoModal = true"
        >
          Registrar egreso / gasto
        </button>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
          @click="showCloseModal = true"
          :disabled="!cajaStore.isCajaAbierta"
        >
          Cerrar turno (arqueo)
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Resumen -->
      <section class="space-y-4">
        <div class="rounded-xl bg-white shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold">Resumen actual</h2>
              <p class="text-xs text-gray-500">
                Turno #{{ cajaStore.resumenActual?.turno_id ?? "-" }} ·
                {{
                  cajaStore.resumenActual?.fecha_apertura
                    ? new Date(
                        cajaStore.resumenActual.fecha_apertura,
                      ).toLocaleString()
                    : "-"
                }}
              </p>
            </div>
            <button
              class="text-sm text-blue-600 hover:underline"
              @click="refrescarResumen"
              :disabled="cajaStore.loading"
            >
              Actualizar
            </button>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-4">
            <div class="rounded-lg border border-gray-200 p-4">
              <p class="text-xs text-gray-500">Monto inicial</p>
              <p class="text-2xl font-semibold">
                S/ {{ formato(cajaStore.resumenActual?.monto_inicial || 0) }}
              </p>
            </div>
            <div class="rounded-lg border border-gray-200 p-4">
              <p class="text-xs text-gray-500">Total egresos</p>
              <p class="text-2xl font-semibold">
                S/ {{ formato(cajaStore.resumenActual?.total_egresos || 0) }}
              </p>
            </div>
            <div class="rounded-lg border border-gray-200 p-4">
              <p class="text-xs text-gray-500">Efectivo ingresado</p>
              <p class="text-2xl font-semibold">
                S/
                {{
                  formato(cajaStore.resumenActual?.monto_efectivo_ingresos || 0)
                }}
              </p>
            </div>
            <div class="rounded-lg border border-gray-200 p-4">
              <p class="text-xs text-gray-500">Ingresos por método</p>
              <p class="text-sm text-gray-600 mt-1">
                Efectivo: S/
                {{
                  formato(
                    cajaStore.resumenActual?.ingresos_por_metodo?.efectivo || 0,
                  )
                }}
              </p>
              <p class="text-sm text-gray-600">
                Tarjeta: S/
                {{
                  formato(
                    cajaStore.resumenActual?.ingresos_por_metodo?.tarjeta || 0,
                  )
                }}
              </p>
              <p class="text-sm text-gray-600">
                Yape: S/
                {{
                  formato(
                    cajaStore.resumenActual?.ingresos_por_metodo?.yape || 0,
                  )
                }}
              </p>
              <p class="text-sm text-gray-600">
                Plin: S/
                {{
                  formato(
                    cajaStore.resumenActual?.ingresos_por_metodo?.plin || 0,
                  )
                }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-xl bg-white shadow p-6">
          <p class="text-sm text-gray-500">Efectivo esperado en cajón</p>
          <p class="text-3xl font-bold mt-2">
            S/
            {{ formato(cajaStore.resumenActual?.monto_efectivo_esperado || 0) }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Incluye ventas en efectivo y ajustes.
          </p>
        </div>
      </section>

      <!-- Acciones -->
      <section class="space-y-4">
        <div class="rounded-xl bg-white shadow p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Estado de Caja</h2>
            <span
              class="px-3 py-1 rounded-full text-xs font-semibold"
              :class="
                cajaStore.isCajaAbierta
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              "
            >
              {{ cajaStore.isCajaAbierta ? "Abierta" : "Cerrada" }}
            </span>
          </div>

          <div class="space-y-2">
            <p class="text-sm text-gray-600">
              Para comenzar un turno, abre la caja con un monto inicial.
            </p>
            <button
              class="w-full px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50"
              @click="openRegisterModal = true"
              :disabled="cajaStore.isCajaAbierta"
            >
              {{ cajaStore.isCajaAbierta ? "Caja abierta" : "Abrir caja" }}
            </button>
          </div>

          <div v-if="cajaStore.error" class="text-sm text-red-600">
            {{ cajaStore.error }}
          </div>

          <div v-if="cajaStore.loading" class="text-sm text-gray-500">
            Cargando estado de caja...
          </div>
        </div>
      </section>
    </div>

    <OpenRegisterModal
      v-model="openRegisterModal"
      :loading="cajaStore.loading"
      @abrir="handleAbrirCaja"
    />

    <CloseRegisterModal
      v-model="showCloseModal"
      :loading="cajaStore.loading"
      @cerrar="handleCerrarCaja"
    />

    <ModalEgreso
      v-model="showEgresoModal"
      :loading="cajaStore.loading"
      @egreso="handleEgreso"
    />

    <CloseRegisterResultModal
      v-model="showCloseResultModal"
      :descuadre="closeResult.descuadre"
      :esperado="closeResult.esperado"
      :declarado="closeResult.declarado"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCajaStore } from "@/stores/caja";
import { useNotify } from "@/composables/useNotify";
import OpenRegisterModal from "@/components/caja/OpenRegisterModal.vue";
import CloseRegisterModal from "@/components/caja/CloseRegisterModal.vue";
import CloseRegisterResultModal from "@/components/caja/CloseRegisterResultModal.vue";

// Modal de egreso básico (puede crearse similar al resto)
import ModalEgreso from "@/components/caja/ModalEgreso.vue";

const cajaStore = useCajaStore();
const notify = useNotify();

const openRegisterModal = ref(false);
const showCloseModal = ref(false);
const showCloseResultModal = ref(false);
const showEgresoModal = ref(false);

const closeResult = ref({
  descuadre: null,
  esperado: null,
  declarado: null,
});

onMounted(() => {
  cajaStore.verificarEstadoCaja();
});

function formato(value) {
  return Number(value || 0).toFixed(2);
}

async function handleAbrirCaja(monto) {
  const { success, error } = await cajaStore.abrirCaja(monto);
  if (success) {
    openRegisterModal.value = false;
  } else {
    notify.error(typeof error === "string" ? error : String(error));
  }
}

async function handleCerrarCaja(montoDeclarado) {
  const { success, data, error } = await cajaStore.cerrarCaja(montoDeclarado);
  if (success) {
    showCloseModal.value = false;

    // El backend devuelve el descuadre y el monto esperado.
    closeResult.value = {
      descuadre: data?.descuadre ?? data?.desc,
      esperado: data?.monto_efectivo_esperado,
      declarado: data?.monto_declarado_cierre,
    };
    showCloseResultModal.value = true;
  } else {
    notify.error(typeof error === "string" ? error : String(error));
  }
}

async function handleEgreso({ monto, descripcion }) {
  const { success, error } = await cajaStore.registrarEgreso(
    monto,
    descripcion,
  );
  if (success) {
    showEgresoModal.value = false;
  } else {
    notify.error(typeof error === "string" ? error : String(error));
  }
}
</script>

<template>
  <div class="p-4 h-full">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Administración de Mesas y Zonas</h1>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Roles: ADMIN</span>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4 h-[calc(100%-72px)]">
      <!-- Zonas -->
      <section
        class="col-span-12 lg:col-span-4 bg-white rounded-xl shadow-sm p-4 flex flex-col"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Zonas del Local</h2>
          <button
            class="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
            @click="openZonaModal()"
          >
            + Nueva Zona
          </button>
        </div>

        <div class="flex-1 overflow-auto scrollbar-thin">
          <template v-if="store.zonas.length">
            <ul class="space-y-2">
              <li
                v-for="zona in store.zonas"
                :key="zona.id"
                class="group p-3 rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                :class="{
                  'bg-blue-50 border-blue-300':
                    store.zonaSeleccionada?.id === zona.id,
                }"
                @click="selectZona(zona)"
              >
                <div>
                  <p class="font-semibold">{{ zona.nombre }}</p>
                  <p class="text-xs text-gray-500">ID: {{ zona.id }}</p>
                </div>
                <div
                  class="flex items-center gap-2 opacity-0 group-hover:opacity-100"
                >
                  <button
                    class="p-1 rounded hover:bg-gray-100"
                    @click.stop="editZona(zona)"
                    title="Editar zona"
                  >
                    <svg
                      class="w-4 h-4 text-gray-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
                      />
                      <path
                        fill-rule="evenodd"
                        d="M2 15.5A1.5 1.5 0 013.5 14H6v1.5A1.5 1.5 0 014.5 17H3.5A1.5 1.5 0 012 15.5z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    class="p-1 rounded hover:bg-gray-100"
                    @click.stop="confirmDeleteZona(zona)"
                    title="Eliminar zona"
                  >
                    <svg
                      class="w-4 h-4 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H3.5A1.5 1.5 0 002 5.5v1A1.5 1.5 0 003.5 8H4v8.5A1.5 1.5 0 005.5 18h9a1.5 1.5 0 001.5-1.5V8h.5a1.5 1.5 0 001.5-1.5v-1A1.5 1.5 0 0016.5 4H15V3a1 1 0 00-1-1H6zm1 3V3h6v2H7z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            </ul>
          </template>
          <div v-else class="text-center text-sm text-gray-500 py-10">
            No hay zonas cargadas.
          </div>
        </div>
      </section>

      <!-- Mesas -->
      <section
        class="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-sm p-4 flex flex-col"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold">
              {{
                store.zonaSeleccionada
                  ? `Mesas en ${store.zonaSeleccionada.nombre}`
                  : "Mesas de la zona"
              }}
            </h2>
            <p class="text-sm text-gray-500">
              Selecciona una zona para ver sus mesas.
            </p>
          </div>
          <button
            class="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
            :disabled="!store.zonaSeleccionada"
            @click="openMesaModal()"
          >
            + Nueva Mesa
          </button>
        </div>

        <template v-if="!store.zonaSeleccionada">
          <div
            class="flex-1 flex flex-col items-center justify-center text-gray-500"
          >
            <div class="text-6xl mb-4">🪑</div>
            <p class="text-lg font-medium">
              Selecciona una zona para ver sus mesas.
            </p>
            <p class="text-sm">
              Puedes crear una nueva zona desde la columna izquierda.
            </p>
          </div>
        </template>

        <template v-else>
          <div class="flex-1 overflow-auto scrollbar-thin">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <template v-if="store.mesasPorZona.length">
                <div
                  v-for="mesa in store.mesasPorZona"
                  :key="mesa.id"
                  class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div class="flex items-start justify-between">
                      <p class="text-xl font-semibold">
                        {{ mesa.numero_nombre }}
                      </p>
                      <div
                        class="flex items-center gap-1 text-gray-500 text-sm"
                      >
                        <span class="inline-flex items-center gap-1">
                          <svg
                            class="w-4 h-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 2a4 4 0 100 8 4 4 0 000-8z" />
                            <path
                              fill-rule="evenodd"
                              d="M2 18a8 8 0 1116 0H2z"
                              clip-rule="evenodd"
                            />
                          </svg>
                          {{ mesa.capacidad || 0 }}
                        </span>
                      </div>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">ID: {{ mesa.id }}</p>
                  </div>
                  <div class="mt-4 flex items-center justify-between">
                    <button
                      class="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                      @click="editMesa(mesa)"
                    >
                      Editar
                    </button>
                    <button
                      class="text-red-600 hover:text-red-800 text-sm font-semibold"
                      @click="confirmDeleteMesa(mesa)"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </template>
              <div v-else class="col-span-full text-center text-gray-500">
                No hay mesas en esta zona.
              </div>
            </div>
          </div>
        </template>
      </section>
    </div>

    <!-- Modales -->
    <ZonaModal
      v-model:visible="showZonaModal"
      :zona="editingZona"
      :loading="store.loading"
      @save="onSaveZona"
      @close="closeZonaModal"
    />

    <MesaModal
      v-model:visible="showMesaModal"
      :mesa="editingMesa"
      :zonaSeleccionada="store.zonaSeleccionada"
      :loading="store.loading"
      @save="onSaveMesa"
      @close="closeMesaModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTableAdminStore } from "@/stores/useTableAdminStore";
import ZonaModal from "@/components/modals/ZonaModal.vue";
import MesaModal from "@/components/modals/MesaModal.vue";

const store = useTableAdminStore();

const showZonaModal = ref(false);
const showMesaModal = ref(false);
const editingZona = ref(null);
const editingMesa = ref(null);

function selectZona(zona) {
  store.selectZona(zona);
  store.fetchMesas(zona.id);
}

function openZonaModal() {
  editingZona.value = null;
  showZonaModal.value = true;
}

function editZona(zona) {
  editingZona.value = { ...zona };
  showZonaModal.value = true;
}

function closeZonaModal() {
  showZonaModal.value = false;
  editingZona.value = null;
}

async function onSaveZona(payload) {
  if (editingZona.value) {
    await store.updateZona(editingZona.value.id, payload);
  } else {
    await store.createZona(payload);
  }
  await store.fetchZonas();
  if (store.zonaSeleccionada) {
    await store.fetchMesas(store.zonaSeleccionada.id);
  }
  closeZonaModal();
}

function confirmDeleteZona(zona) {
  if (!zona) return;
  const confirmed = window.confirm(
    `¿Estás seguro de eliminar la zona "${zona.nombre}"? Esto eliminará también las mesas asociadas.`,
  );
  if (!confirmed) return;
  store.deleteZona(zona.id);
}

function openMesaModal() {
  editingMesa.value = null;
  showMesaModal.value = true;
}

function editMesa(mesa) {
  editingMesa.value = { ...mesa };
  showMesaModal.value = true;
}

function closeMesaModal() {
  showMesaModal.value = false;
  editingMesa.value = null;
}

async function onSaveMesa(payload) {
  if (!store.zonaSeleccionada) return;
  const body = {
    ...payload,
    zona_id: store.zonaSeleccionada.id,
  };
  if (editingMesa.value) {
    await store.updateMesa(editingMesa.value.id, body);
  } else {
    await store.createMesa(body);
  }
  await store.fetchMesas(store.zonaSeleccionada.id);
  closeMesaModal();
}

function confirmDeleteMesa(mesa) {
  if (!mesa) return;
  const confirmed = window.confirm(
    `¿Estás seguro de eliminar la mesa "${mesa.numero_nombre}"?`,
  );
  if (!confirmed) return;
  store.deleteMesa(mesa.id);
}

onMounted(async () => {
  await store.fetchZonas();
  if (store.zonaSeleccionada) {
    await store.fetchMesas(store.zonaSeleccionada.id);
  }
});
</script>

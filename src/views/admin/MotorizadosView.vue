<template>
  <div class="h-full flex flex-col p-3 md:p-6">
    <!-- Header -->
    <div
      class="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div>
        <h1
          class="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2"
        >
          <Bike :size="32" class="text-blue-600" /> Gestión de Motorizados
        </h1>
        <p class="text-sm text-gray-600 mt-1">
          Administra los motorizados y su disponibilidad
        </p>
      </div>

      <button
        @click="abrirModalCrear"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Nuevo Motorizado
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 md:mb-6 flex flex-wrap gap-2">
      <button
        @click="filtro = 'todos'"
        class="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        :class="
          filtro === 'todos'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        "
      >
        Todos ({{ motorizadosStore.motorizados.length }})
      </button>
      <button
        @click="filtro = 'activos'"
        class="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        :class="
          filtro === 'activos'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        "
      >
        Solo Activos ({{ motorizadosStore.motorizadosActivos.length }})
      </button>
      <button
        @click="filtro = 'disponibles'"
        class="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        :class="
          filtro === 'disponibles'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        "
      >
        ✅ Disponibles ({{ motorizadosStore.motorizadosDisponibles.length }})
      </button>
    </div>

    <!-- Lista de Motorizados -->
    <div class="flex-1 overflow-y-auto">
      <!-- Loading -->
      <div
        v-if="motorizadosStore.loading && motorizadosFiltrados.length === 0"
        class="flex items-center justify-center py-12"
      >
        <svg
          class="animate-spin h-8 w-8 text-blue-600"
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
        v-else-if="motorizadosFiltrados.length === 0"
        class="flex flex-col items-center justify-center py-12 text-gray-400"
      >
        <svg
          class="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p class="text-lg font-medium">No hay motorizados registrados</p>
        <p class="text-sm mt-1">Crea el primer motorizado para comenzar</p>
      </div>

      <!-- Gri d de Tarjetas -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <MotorizadoCard
          v-for="motorizado in motorizadosFiltrados"
          :key="motorizado.id"
          :motorizado="motorizado"
          @editar="abrirModalEditar"
          @eliminar="confirmarEliminar"
          @cambiar-disponibilidad="handleCambiarDisponibilidad"
        />
      </div>
    </div>

    <!-- Modal Formulario -->
    <MotorizadoForm
      v-model="mostrarModal"
      :motorizado="motorizadoEditando"
      :loading="loadingGuardar"
      :error="errorGuardar"
      @guardar="handleGuardar"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Bike } from "lucide-vue-next";
import { useMotorizadosStore } from "@/stores/motorizados";
import { useNotify } from "@/composables/useNotify";
import MotorizadoCard from "@/components/motorizado/MotorizadoCard.vue";
import MotorizadoForm from "@/components/motorizado/MotorizadoForm.vue";

const motorizadosStore = useMotorizadosStore();
const notify = useNotify();

const filtro = ref("todos");
const mostrarModal = ref(false);
const motorizadoEditando = ref(null);
const loadingGuardar = ref(false);
const errorGuardar = ref(null);

const motorizadosFiltrados = computed(() => {
  if (filtro.value === "activos") {
    return motorizadosStore.motorizadosActivos;
  } else if (filtro.value === "disponibles") {
    return motorizadosStore.motorizadosDisponibles;
  }
  return motorizadosStore.motorizados;
});

onMounted(() => {
  fetchMotorizados();
});

async function fetchMotorizados() {
  const { success, error } = await motorizadosStore.fetchMotorizados();
  if (!success) {
    notify.error(error || "Error al cargar motorizados");
  }
}

function abrirModalCrear() {
  motorizadoEditando.value = null;
  errorGuardar.value = null;
  mostrarModal.value = true;
}

function abrirModalEditar(motorizado) {
  motorizadoEditando.value = motorizado;
  errorGuardar.value = null;
  mostrarModal.value = true;
}

async function handleGuardar(datos) {
  loadingGuardar.value = true;
  errorGuardar.value = null;

  try {
    let result;

    if (motorizadoEditando.value) {
      // Actualizar
      result = await motorizadosStore.actualizarMotorizado(
        motorizadoEditando.value.id,
        datos,
      );
    } else {
      // Crear
      result = await motorizadosStore.crearMotorizado(datos);
    }

    if (result.success) {
      notify.success(
        motorizadoEditando.value
          ? "Motorizado actualizado correctamente"
          : "Motorizado creado correctamente",
      );
      mostrarModal.value = false;
    } else {
      errorGuardar.value = result.error || "Error al guardar motorizado";
    }
  } finally {
    loadingGuardar.value = false;
  }
}

async function handleCambiarDisponibilidad({ motorizadoId, disponible }) {
  const { success, error } = await motorizadosStore.cambiarDisponibilidad(
    motorizadoId,
    disponible,
  );

  if (success) {
    notify.success(
      disponible ? "Motorizado disponible" : "Motorizado no disponible",
    );
  } else {
    notify.error(error || "Error al cambiar disponibilidad");
  }
}

async function confirmarEliminar(motorizado) {
  if (
    confirm(`¿Estás seguro de eliminar al motorizado "${motorizado.nombre}"?`)
  ) {
    const { success, error } = await motorizadosStore.eliminarMotorizado(
      motorizado.id,
    );

    if (success) {
      notify.success("Motorizado eliminado correctamente");
    } else {
      notify.error(error || "Error al eliminar motorizado");
    }
  }
}
</script>

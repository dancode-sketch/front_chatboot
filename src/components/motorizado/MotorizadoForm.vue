<template>
  <!-- Modal Overlay -->
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="cerrar"
  >
    <!-- Modal Content -->
    <div
      class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ esEdicion ? "✏️ Editar Motorizado" : "➕ Nuevo Motorizado" }}
          </h2>
          <button
            @click="cerrar"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="guardar" class="px-6 py-4 space-y-4">
        <!-- Nombre -->
        <div>
          <label
            for="nombre"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre Completo*
          </label>
          <input
            id="nombre"
            v-model="form.nombre"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Juan Pérez"
          />
        </div>

        <!-- Teléfono -->
        <div>
          <label
            for="telefono"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Teléfono*
          </label>
          <input
            id="telefono"
            v-model="form.telefono"
            type="tel"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="51987654321"
          />
          <p class="mt-1 text-xs text-gray-500">
            Formato: Código de país + número (ej: 51987654321)
          </p>
        </div>

        <!-- URL Foto -->
        <div>
          <label
            for="foto_url"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            URL de Foto
          </label>
          <input
            id="foto_url"
            v-model="form.foto_url"
            type="url"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://ejemplo.com/foto.jpg"
          />
          <p class="mt-1 text-xs text-gray-500">
            Opcional: Link directo a la foto del motorizado
          </p>
        </div>

        <!-- Username -->
        <div>
          <label
            for="username"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Usuario (Login)*
          </label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            :disabled="esEdicion"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="juan_motorizado"
          />
          <p v-if="esEdicion" class="mt-1 text-xs text-gray-500">
            El username no se puede modificar
          </p>
        </div>

        <!-- Password (solo en creación o si se quiere cambiar) -->
        <div v-if="!esEdicion || mostrarCambiarPassword">
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ esEdicion ? "Nueva Contraseña" : "Contraseña*" }}
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            :required="!esEdicion"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
            minlength="6"
          />
          <p class="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
        </div>

        <!-- Botón cambiar password (solo edición) -->
        <div v-if="esEdicion && !mostrarCambiarPassword">
          <button
            type="button"
            @click="mostrarCambiarPassword = true"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Lock :size="14" /> Cambiar contraseña
          </button>
        </div>

        <!-- Switches (solo en edición) -->
        <div v-if="esEdicion" class="space-y-3 pt-2">
          <!-- Activo -->
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">
              ¿Motorizado activo?
            </label>
            <button
              type="button"
              @click="form.is_active = !form.is_active"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :class="form.is_active ? 'bg-blue-600' : 'bg-gray-300'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="form.is_active ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>

          <!-- Disponible -->
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">
              ¿Disponible para asignar pedidos?
            </label>
            <button
              type="button"
              @click="form.esta_disponible = !form.esta_disponible"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              :class="form.esta_disponible ? 'bg-green-600' : 'bg-gray-300'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="
                  form.esta_disponible ? 'translate-x-6' : 'translate-x-1'
                "
              />
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <button
            type="button"
            @click="cerrar"
            :disabled="loading"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <svg
              v-if="loading"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            {{ esEdicion ? "Actualizar" : "Crear Motorizado" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { Lock } from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  motorizado: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "guardar"]);

const esEdicion = computed(() => !!props.motorizado);
const mostrarCambiarPassword = ref(false);

const form = ref({
  nombre: "",
  telefono: "",
  foto_url: "",
  username: "",
  password: "",
  is_active: true,
  esta_disponible: true,
});

// Cargar datos al editar
watch(
  () => props.motorizado,
  (motorizado) => {
    if (motorizado) {
      form.value = {
        nombre: motorizado.nombre || "",
        telefono: motorizado.telefono || "",
        foto_url: motorizado.foto_url || "",
        username: motorizado.username || "",
        password: "",
        is_active: motorizado.is_active ?? true,
        esta_disponible: motorizado.esta_disponible ?? true,
      };
      mostrarCambiarPassword.value = false;
    } else {
      // Reset form
      form.value = {
        nombre: "",
        telefono: "",
        foto_url: "",
        username: "",
        password: "",
        is_active: true,
        esta_disponible: true,
      };
    }
  },
  { immediate: true },
);

function cerrar() {
  emit("update:modelValue", false);
}

function guardar() {
  const datos = { ...form.value };

  // Si es edición y no se cambió password, no enviarlo
  if (esEdicion.value && !mostrarCambiarPassword.value) {
    delete datos.password;
  }

  // Si password está vacío, no enviarlo
  if (!datos.password) {
    delete datos.password;
  }

  emit("guardar", datos);
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-xl w-full max-w-md p-6">
      <div class="flex items-start justify-between">
        <h3 class="text-lg font-semibold">
          {{ zona ? "Editar zona" : "Nueva zona" }}
        </h3>
        <button class="text-gray-500 hover:text-gray-700" @click="close">
          ✕
        </button>
      </div>
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          v-model="form.nombre"
          type="text"
          class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Ej: Terraza"
        />
      </div>
      <div class="mt-6 flex justify-end gap-2">
        <button
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          @click="close"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          @click="save"
          :disabled="!form.nombre.trim() || loading"
        >
          {{ zona ? "Guardar" : "Crear" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  visible: Boolean,
  zona: Object,
  loading: Boolean,
});

const emit = defineEmits(["update:visible", "save", "close"]);

const form = ref({ nombre: "" });

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      form.value = { nombre: "" };
    }
  },
);

watch(
  () => props.zona,
  (val) => {
    if (val) {
      form.value = { nombre: val.nombre || "" };
    }
  },
  { immediate: true },
);

function close() {
  emit("update:visible", false);
  emit("close");
}

function save() {
  if (!form.value.nombre?.trim()) return;
  emit("save", { nombre: form.value.nombre.trim() });
}
</script>

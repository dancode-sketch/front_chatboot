<template>
  <div class="p-4">
    <div
      class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <h1 class="text-xl font-bold">Grupos de modificadores</h1>
      <button class="btn btn-primary" @click="createNew()">
        + Nuevo grupo global
      </button>
    </div>

    <div class="mt-4 overflow-x-auto">
      <table class="min-w-full table-auto">
        <thead>
          <tr>
            <th class="border px-2 py-1">Nombre</th>
            <th class="border px-2 py-1">Requerido</th>
            <th class="border px-2 py-1">Selección múltiple</th>
            <th class="border px-2 py-1">Min / Max</th>
            <th class="border px-2 py-1">Opciones</th>
            <th class="border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="group in modifiers" :key="group.id">
            <td class="border px-2 py-1">{{ group.nombre }}</td>
            <td class="border px-2 py-1">
              {{ group.requerido ? "Sí" : "No" }}
            </td>
            <td class="border px-2 py-1">
              {{ group.seleccion_multiple ? "Sí" : "No" }}
            </td>
            <td class="border px-2 py-1">
              <span v-if="group.seleccion_multiple">
                {{ group.min_opciones }} / {{ group.max_opciones }}
              </span>
              <span v-else class="text-gray-500">-</span>
            </td>
            <td class="border px-2 py-1">{{ group.opciones?.length || 0 }}</td>
            <td class="border px-2 py-1 space-x-2">
              <button class="text-blue-500" @click="editGroup(group)">
                Editar
              </button>
              <button class="text-red-500" @click="removeGroup(group.id)">
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="!modifiers.length">
            <td class="border px-2 py-4 text-center" colspan="6">
              No hay grupos creados aún.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
    >
      <div class="bg-white p-4 rounded w-full max-w-2xl">
        <h2 class="font-bold mb-3">
          {{ editing ? "Editar grupo" : "Nuevo grupo" }}
        </h2>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium">Nombre</label>
            <input
              v-model="form.nombre"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Ej. Tipos de pan"
            />
          </div>

          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="form.requerido"
                class="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              Requerido
            </label>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="form.seleccion_multiple"
                class="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              Selección múltiple
            </label>
          </div>

          <div v-if="form.seleccion_multiple" class="space-y-2">
            <div>
              <label class="block text-sm font-medium"
                >Mínimo de opciones</label
              >
              <input
                type="number"
                min="0"
                v-model.number="form.min_opciones"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label class="block text-sm font-medium"
                >Máximo de opciones</label
              >
              <input
                type="number"
                min="0"
                v-model.number="form.max_opciones"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold">Opciones</h3>
            <button
              type="button"
              class="rounded-lg bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
              @click="addOption"
            >
              + Agregar opción
            </button>
          </div>

          <div v-if="!form.opciones.length" class="mt-2 text-xs text-gray-500">
            Agrega al menos una opción para que el grupo sea útil.
          </div>

          <div
            v-for="(opt, idx) in form.opciones"
            :key="idx"
            class="mt-3 grid gap-2 md:grid-cols-3"
          >
            <input
              v-model="opt.nombre"
              type="text"
              placeholder="Nombre de opción"
              class="rounded-lg border border-gray-300 px-3 py-2"
            />
            <input
              v-model.number="opt.precio_extra"
              type="number"
              step="0.01"
              min="0"
              placeholder="Precio extra"
              class="rounded-lg border border-gray-300 px-3 py-2"
            />
            <button
              type="button"
              class="rounded-lg bg-red-600 px-3 py-2 text-xs text-white hover:bg-red-700"
              @click="removeOption(idx)"
            >
              Quitar
            </button>
          </div>
        </div>

        <div
          class="mt-4 flex flex-col gap-3 border-t pt-4 md:flex-row md:justify-end"
        >
          <button
            type="button"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 md:w-auto"
            @click="cancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 md:w-auto"
            :disabled="saving"
            @click="save"
          >
            {{
              saving
                ? "Guardando..."
                : editing
                  ? "Guardar cambios"
                  : "Crear grupo"
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useModifiersStore } from "@/stores/useModifiersStore";

const store = useModifiersStore();

const modifiers = ref([]);
const showModal = ref(false);
const editing = ref(false);
const saving = ref(false);

const defaultForm = () => ({
  nombre: "",
  requerido: false,
  seleccion_multiple: false,
  min_opciones: 1,
  max_opciones: 1,
  opciones: [{ nombre: "", precio_extra: 0 }],
});

const form = ref(defaultForm());

async function loadModifiers() {
  await store.fetchModifiers();
  modifiers.value = store.modifiers;
}

function createNew() {
  editing.value = false;
  form.value = defaultForm();
  showModal.value = true;
}

function editGroup(group) {
  editing.value = true;
  form.value = {
    id: group.id,
    nombre: group.nombre || "",
    requerido: Boolean(group.requerido),
    seleccion_multiple: Boolean(group.seleccion_multiple),
    min_opciones: group.min_opciones ?? 1,
    max_opciones: group.max_opciones ?? 1,
    opciones: Array.isArray(group.opciones)
      ? group.opciones.map((o) => ({
          nombre: o.nombre || "",
          precio_extra: o.precio_extra || 0,
        }))
      : [{ nombre: "", precio_extra: 0 }],
  };
  showModal.value = true;
}

function cancel() {
  showModal.value = false;
  editing.value = false;
  form.value = defaultForm();
}

function addOption() {
  form.value.opciones.push({ nombre: "", precio_extra: 0 });
}

function removeOption(index) {
  form.value.opciones.splice(index, 1);
}

async function save() {
  saving.value = true;
  try {
    const payload = {
      nombre: form.value.nombre,
      requerido: Boolean(form.value.requerido),
      seleccion_multiple: Boolean(form.value.seleccion_multiple),
      min_opciones: Number(form.value.min_opciones) || 0,
      max_opciones: Number(form.value.max_opciones) || 0,
      opciones: (form.value.opciones || [])
        .filter((o) => o.nombre?.trim())
        .map((o) => ({
          nombre: o.nombre,
          precio_extra: Number(o.precio_extra) || 0,
        })),
    };

    if (editing.value) {
      await store.updateModifier(form.value.id, payload);
    } else {
      await store.createModifier(payload);
    }

    await loadModifiers();
    cancel();
  } finally {
    saving.value = false;
  }
}

async function removeGroup(id) {
  if (!confirm("¿Eliminar grupo? Esta acción no se puede deshacer.")) return;
  await store.deleteModifier(id);
  await loadModifiers();
}

loadModifiers();
</script>

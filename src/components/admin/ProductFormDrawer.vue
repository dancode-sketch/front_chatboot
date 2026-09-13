<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex"
      aria-labelledby="drawer-title"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/40 transition-opacity"
        @click="close"
      ></div>

      <!-- Drawer -->
      <section
        class="relative ml-auto h-full w-full max-w-full bg-white shadow-xl transition-transform md:w-1/2"
      >
        <div class="flex items-center justify-between border-b px-4 py-3">
          <h2 id="drawer-title" class="text-lg font-semibold">
            {{ isEdit ? "Editar producto" : "Nuevo producto" }}
          </h2>
          <button
            type="button"
            class="text-gray-500 hover:text-gray-700"
            @click="close"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form
          class="flex h-full flex-col overflow-y-auto p-4"
          @submit.prevent="onSubmit"
        >
          <!-- Imagen -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Imagen</label>
            <div
              class="relative rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center hover:border-blue-400 hover:bg-white"
              @drop.prevent="handleDrop"
              @dragover.prevent
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer"
                @change="handleFileChange"
              />
              <div class="flex flex-col items-center justify-center gap-2">
                <div class="text-3xl">📷</div>
                <div class="text-sm text-gray-600">
                  Arrastra o haz clic aquí para subir una imagen
                </div>
                <div v-if="uploading" class="text-xs text-gray-500">
                  Subiendo…
                </div>
              </div>
              <div
                v-if="form.imagen_url"
                class="absolute right-3 top-3 h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                <img
                  :src="form.imagen_url"
                  alt="Imagen producto"
                  class="h-full w-full object-cover"
                />
              </div>
            </div>
            <p class="text-xs text-gray-500">
              Se guardará la URL en el producto para mostrarla en el catálogo.
            </p>
          </div>

          <!-- Nombre / Precio / Activo -->
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Nombre</label
              >
              <input
                v-model="form.nombre"
                type="text"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Ej: Hamburguesa clásica"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Precio</label
              >
              <input
                v-model.number="form.precio"
                type="number"
                min="0"
                step="0.01"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Categoría</label
              >
              <div class="relative">
                <input
                  v-model="categoryInput"
                  list="categories-list"
                  type="text"
                  class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Selecciona o crea una categoría"
                />
                <datalist id="categories-list">
                  <option
                    v-for="cat in categories"
                    :key="cat.id"
                    :value="cat.nombre"
                  />
                </datalist>
              </div>
              <div
                class="mt-1 flex items-center justify-between gap-2 text-xs text-gray-500"
              >
                <span v-if="selectedCategory"
                  >Categoría seleccionada:
                  <strong>{{ selectedCategory.nombre }}</strong></span
                >
                <button
                  v-if="canCreateCategory"
                  type="button"
                  class="rounded-lg bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                  @click="createCategory"
                  :disabled="creatingCategory"
                >
                  {{ creatingCategory ? "Creando..." : "Crear categoría" }}
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <input
                id="activo"
                type="checkbox"
                v-model="form.activo"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="activo" class="text-sm font-medium text-gray-700"
                >Activo</label
              >
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Descripción</label
            >
            <textarea
              v-model="form.descripcion"
              rows="3"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Opcional"
            ></textarea>
          </div>

          <!-- Sinónimos -->
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Sinónimos</label
            >
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <span
                v-for="(syn, index) in form.sinonimos"
                :key="syn + index"
                class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800"
              >
                {{ syn }}
                <button
                  type="button"
                  class="ml-2 text-blue-600 hover:text-blue-800"
                  @click="removeSynonym(index)"
                >
                  ✕
                </button>
              </span>
              <input
                v-model="newSynonym"
                @keydown.enter.prevent="addSynonym"
                @keydown="onSynonymKeyDown"
                type="text"
                class="min-w-[160px] flex-1 rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Escribe y presiona Enter o ,"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Estos términos ayudan a encontrar el producto en búsquedas.
            </p>
          </div>

          <!-- Variantes -->
          <div
            class="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold">Variantes / Tamaños</h3>
              <button
                type="button"
                class="rounded-lg bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                @click="addVariant"
              >
                + Agregar
              </button>
            </div>
            <div
              v-if="form.variantes.length === 0"
              class="text-xs text-gray-500"
            >
              Añade variantes para permitir múltiples tamaños/precios.
            </div>
            <div
              v-for="(variant, index) in form.variantes"
              :key="index"
              class="grid gap-2 md:grid-cols-3"
            >
              <input
                v-model="variant.nombre"
                type="text"
                placeholder="Nombre (ej. Simple)"
                class="rounded-lg border border-gray-300 px-3 py-2"
              />
              <input
                v-model.number="variant.precio"
                type="number"
                step="0.01"
                min="0"
                placeholder="Precio"
                class="rounded-lg border border-gray-300 px-3 py-2"
              />
              <button
                type="button"
                class="rounded-lg bg-red-600 px-3 py-2 text-xs text-white hover:bg-red-700"
                @click="removeVariant(index)"
              >
                Quitar
              </button>
            </div>
          </div>

          <!-- Modificadores Globales vinculados -->
          <div
            class="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold">
                Modificadores globales vinculados
              </h3>
              <button
                type="button"
                class="rounded-lg bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                @click="modifiersStore.fetchModifiers()"
              >
                Actualizar lista
              </button>
            </div>

            <div v-if="modifiersLoading" class="text-xs text-gray-500">
              Cargando grupos...
            </div>

            <div v-else-if="!modifiers.length" class="text-xs text-gray-500">
              No hay grupos creados aún. Ve a Modificadores para crear uno.
            </div>

            <div v-else class="grid gap-2 md:grid-cols-2">
              <label
                v-for="group in modifiers"
                :key="group.id"
                class="flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  :value="group.id"
                  v-model="form.grupo_modificador_ids"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <div>
                  <div class="font-medium">{{ group.nombre }}</div>
                  <div class="text-xs text-gray-500">
                    <span v-if="group.requerido">Requerido</span>
                    <span v-if="group.seleccion_multiple">
                      <span v-if="group.requerido"> · </span>
                      Selección múltiple
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div
            class="flex flex-col gap-3 border-t pt-4 md:flex-row md:justify-end"
          >
            <button
              type="button"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 md:w-auto"
              @click="close"
              :disabled="saving"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 md:w-auto"
              :disabled="saving"
            >
              {{
                saving
                  ? isEdit
                    ? "Guardando..."
                    : "Creando..."
                  : isEdit
                    ? "Guardar cambios"
                    : "Crear producto"
              }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from "vue";
import { apiHelpers } from "@/composables/useApi";
import { useModifiersStore } from "@/stores/useModifiersStore";

const props = defineProps({
  modelValue: Boolean,
  product: {
    type: Object,
    default: null,
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "save", "category-created"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const isEdit = computed(() => Boolean(props.product && props.product.id));

const saving = ref(false);
const uploading = ref(false);
const creatingCategory = ref(false);

const fileInput = ref(null);

const defaultForm = () => ({
  nombre: "",
  precio: 0,
  descripcion: "",
  categoria_id: null,
  activo: true,
  imagen_url: "",
  sinonimos: [],
  variantes: [],
  grupo_modificador_ids: [],
});

const form = reactive(defaultForm());
const categoryInput = ref("");
const newSynonym = ref("");

const selectedCategory = computed(() => {
  if (!props.categories?.length) return null;
  return props.categories.find((c) => c.id === form.categoria_id) || null;
});

const canCreateCategory = computed(() => {
  const name = categoryInput.value?.trim();
  if (!name) return false;
  if (
    props.categories.some((c) => c.nombre?.toLowerCase() === name.toLowerCase())
  )
    return false;
  return true;
});

function resetForm() {
  Object.assign(form, defaultForm());
  categoryInput.value = "";
  newSynonym.value = "";
}

watch(
  () => props.product,
  (prod) => {
    if (!prod) {
      resetForm();
      return;
    }

    // Clone to avoid mutating prop
    Object.assign(form, {
      nombre: prod.nombre ?? "",
      precio: prod.precio ?? 0,
      descripcion: prod.descripcion ?? "",
      categoria_id: prod.categoria_id ?? null,
      activo: prod.activo ?? true,
      imagen_url: prod.imagen_url ?? "",
      sinonimos: Array.isArray(prod.sinonimos) ? [...prod.sinonimos] : [],
      variantes: Array.isArray(prod.variantes)
        ? prod.variantes.map((v) => ({ ...v }))
        : [],
      grupo_modificador_ids: Array.isArray(prod.grupo_modificador_ids)
        ? [...prod.grupo_modificador_ids]
        : [],
    });

    categoryInput.value = selectedCategory.value?.nombre || "";
  },
  { immediate: true },
);

const modifiersStore = useModifiersStore();
const modifiers = computed(() => modifiersStore.modifiers);
const modifiersLoading = computed(() => modifiersStore.loading);

watch(
  () => visible.value,
  (val) => {
    if (!val) {
      resetForm();
    } else {
      // Refresh modifiers list when opening the drawer
      modifiersStore.fetchModifiers();

      // Ensure dropdown options exist for category
      nextTick(() => {
        if (fileInput.value) fileInput.value.value = null;
      });
    }
  },
);

function close() {
  visible.value = false;
}

async function handleUpload(file) {
  if (!file) return;
  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const { data, error } = await apiHelpers.post(
      "/api/upload/imagen",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    if (error) {
      console.error("Error uploading image:", error);
      return;
    }
    if (data?.url) {
      form.imagen_url = data.url;
    }
  } finally {
    uploading.value = false;
  }
}

function handleFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  handleUpload(file);
}

function handleDrop(event) {
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  handleUpload(file);
}

function addSynonym() {
  const value = newSynonym.value.trim();
  if (!value) return;
  if (!form.sinonimos.includes(value)) {
    form.sinonimos.push(value);
  }
  newSynonym.value = "";
}

function onSynonymKeyDown(event) {
  if (event.key === "," || event.key === "Tab") {
    event.preventDefault();
    addSynonym();
  }
}

function removeSynonym(index) {
  form.sinonimos.splice(index, 1);
}

function addVariant() {
  form.variantes.push({ nombre: "", precio: 0 });
}

function removeVariant(index) {
  form.variantes.splice(index, 1);
}

watch(
  () => categoryInput.value,
  (val) => {
    const text = val?.trim();
    if (!text) {
      form.categoria_id = null;
      return;
    }
    const found = props.categories.find(
      (c) => c.nombre?.toLowerCase() === text.toLowerCase(),
    );
    if (found) {
      form.categoria_id = found.id;
    }
  },
);

async function createCategory() {
  if (!canCreateCategory.value) return;
  creatingCategory.value = true;
  try {
    const payload = { nombre: categoryInput.value.trim() };
    const { data, error } = await apiHelpers.post(
      "/api/admin/categories",
      payload,
    );
    if (error) {
      console.error("Error creating category:", error);
      return;
    }
    if (data) {
      emit("category-created", data);
      form.categoria_id = data.id;
      categoryInput.value = data.nombre;
    }
  } finally {
    creatingCategory.value = false;
  }
}

async function onSubmit() {
  saving.value = true;
  try {
    // Normalize data
    const payload = {
      nombre: form.nombre,
      precio: Number(form.precio) || 0,
      descripcion: form.descripcion,
      categoria_id: form.categoria_id,
      activo: Boolean(form.activo),
      imagen_url: form.imagen_url,
      sinonimos: form.sinonimos.filter(Boolean),
      variantes: form.variantes
        .filter((v) => v.nombre?.trim())
        .map((v) => ({
          nombre: v.nombre,
          precio: Number(v.precio) || 0,
        })),
      grupo_modificador_ids: Array.isArray(form.grupo_modificador_ids)
        ? form.grupo_modificador_ids.filter(Boolean)
        : [],
    };

    emit("save", { payload, isEdit: isEdit.value });
  } finally {
    saving.value = false;
  }
}
</script>

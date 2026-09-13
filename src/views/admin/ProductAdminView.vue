<template>
  <div class="p-4">
    <div
      class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-xl font-bold">Productos</h1>
        <p class="text-sm text-gray-600">
          Administra tus productos, variantes, modificadores e imágenes.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button class="btn btn-primary" @click="openNew">
          + Nuevo producto
        </button>
        <button class="btn btn-secondary" @click="refresh" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
      </div>
    </div>

    <div class="overflow-x-auto rounded-lg border border-gray-200">
      <table class="min-w-full table-auto">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="border px-3 py-2 text-left text-xs font-semibold text-gray-600"
            >
              Imagen
            </th>
            <th
              class="border px-3 py-2 text-left text-xs font-semibold text-gray-600"
            >
              Nombre
            </th>
            <th
              class="border px-3 py-2 text-left text-xs font-semibold text-gray-600"
            >
              Precio
            </th>
            <th
              class="border px-3 py-2 text-left text-xs font-semibold text-gray-600"
            >
              Categoría
            </th>
            <th
              class="border px-3 py-2 text-left text-xs font-semibold text-gray-600"
            >
              Activo
            </th>
            <th
              class="border px-3 py-2 text-left text-xs font-semibold text-gray-600"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="prod in products" :key="prod.id" class="hover:bg-gray-50">
            <td class="border px-3 py-2">
              <div class="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                <img
                  v-if="prod.imagen_url"
                  :src="prod.imagen_url"
                  :alt="prod.nombre"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center text-xs text-gray-400"
                >
                  Sin imagen
                </div>
              </div>
            </td>
            <td class="border px-3 py-2">{{ prod.nombre }}</td>
            <td class="border px-3 py-2">{{ formatCurrency(prod.precio) }}</td>
            <td class="border px-3 py-2">
              {{ prod.categoria_nombre || prod.categoria_id || "-" }}
            </td>
            <td class="border px-3 py-2">{{ prod.activo ? "Sí" : "No" }}</td>
            <td class="border px-3 py-2">
              <div class="flex flex-wrap gap-2">
                <button
                  class="text-blue-600 hover:text-blue-800"
                  @click="edit(prod)"
                >
                  Editar
                </button>
                <button
                  class="text-red-600 hover:text-red-800"
                  @click="remove(prod.id)"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!products.length">
            <td
              colspan="6"
              class="border px-3 py-6 text-center text-sm text-gray-500"
            >
              No se encontraron productos.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ProductFormDrawer
      v-model="drawerOpen"
      :product="selectedProduct"
      :categories="categories"
      @save="onSave"
      @category-created="onCategoryCreated"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useProductsStore } from "@/stores/products";
import { useCategoriesStore } from "@/stores/categories";
import ProductFormDrawer from "@/components/admin/ProductFormDrawer.vue";

const productsStore = useProductsStore();
const categoriesStore = useCategoriesStore();

const products = ref([]);
const categories = ref([]);
const loading = ref(false);

const drawerOpen = ref(false);
const selectedProduct = ref(null);

function formatCurrency(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(num);
}

async function load() {
  loading.value = true;
  try {
    await categoriesStore.fetchCategories();
    categories.value = categoriesStore.categories;
    await productsStore.fetchProducts(true);
    products.value = productsStore.products;
  } finally {
    loading.value = false;
  }
}

function openNew() {
  selectedProduct.value = null;
  drawerOpen.value = true;
}

function edit(product) {
  selectedProduct.value = product;
  drawerOpen.value = true;
}

async function remove(id) {
  if (!confirm("¿Eliminar producto?")) return;
  await productsStore.deleteProduct(id);
  await load();
}

async function onSave({ payload, isEdit }) {
  if (isEdit && selectedProduct.value?.id) {
    await productsStore.updateProduct(selectedProduct.value.id, payload);
  } else {
    await productsStore.createProduct(payload);
  }
  await load();
  drawerOpen.value = false;
}

function onCategoryCreated(category) {
  categories.value = [...categories.value, category];
}

async function refresh() {
  await load();
}

onMounted(() => {
  load();
});
</script>

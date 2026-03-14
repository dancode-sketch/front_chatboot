<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Productos</h1>
    <div class="mb-2 flex space-x-2">
      <button class="btn btn-primary" @click="startNew">Nuevo producto</button>
      <button class="btn btn-secondary" @click="downloadCatalog">
        Descargar catálogo
      </button>
      <input type="file" ref="fileInput" class="hidden" @change="handleFile" />
      <button class="btn btn-secondary" @click="triggerFileInput">
        Importar catálogo
      </button>
    </div>

    <table class="min-w-full table-auto">
      <thead>
        <tr>
          <th class="border px-2 py-1">Nombre</th>
          <th class="border px-2 py-1">Precio</th>
          <th class="border px-2 py-1">Categoría</th>
          <th class="border px-2 py-1">Activo</th>
          <th class="border px-2 py-1">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prod in products" :key="prod.id">
          <td>{{ prod.nombre }}</td>
          <td>{{ prod.precio }}</td>
          <td>{{ prod.categoria_nombre || prod.categoria_id }}</td>
          <td>{{ prod.activo ? "Sí" : "No" }}</td>
          <td>
            <button class="text-blue-500" @click="edit(prod)">Editar</button>
            <button class="text-red-500" @click="remove(prod.id)">
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
    >
      <div class="bg-white p-4 rounded w-96 overflow-auto max-h-[90vh]">
        <h2 class="font-bold mb-2">
          {{ editing ? "Editar" : "Nuevo" }} producto
        </h2>
        <div class="mb-2">
          <label for="prod-nombre">Nombre</label>
          <input
            id="prod-nombre"
            v-model="form.nombre"
            class="w-full border px-1 py-0.5"
          />
        </div>
        <div class="mb-2">
          <label for="prod-precio">Precio</label>
          <input
            id="prod-precio"
            type="number"
            step="0.01"
            v-model.number="form.precio"
            class="w-full border px-1 py-0.5"
          />
        </div>
        <div class="mb-2">
          <label for="prod-categoria">Categoría</label>
          <select
            id="prod-categoria"
            v-model="form.categoria_id"
            class="w-full border px-1 py-0.5"
          >
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.nombre }}
            </option>
          </select>
        </div>
        <div class="mb-2">
          <label for="prod-activo">
            <input id="prod-activo" type="checkbox" v-model="form.activo" />
            Activo
          </label>
        </div>
        <div class="mb-2">
          <label for="prod-sinonimos">Sinónimos (separados por coma)</label>
          <input
            id="prod-sinonimos"
            v-model="synonymsText"
            class="w-full border px-1 py-0.5"
          />
        </div>
        <button class="btn btn-primary mr-2" @click="save">Guardar</button>
        <button class="btn" @click="cancel">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useProductsStore } from "@/stores/products";
import { useCategoriesStore } from "@/stores/categories";
import { apiHelpers } from "@/composables/useApi";

export default {
  setup() {
    const productsStore = useProductsStore();
    const categoriesStore = useCategoriesStore();

    const products = ref([]);
    const categories = ref([]);

    const showModal = ref(false);
    const editing = ref(false);
    const form = ref({ sinonimos: [] });
    const synonymsText = ref("");

    async function load() {
      await categoriesStore.fetchCategories();
      categories.value = categoriesStore.categories;
      await productsStore.fetchProducts(true);
      products.value = productsStore.products;
    }
    load();

    function startNew() {
      editing.value = false;
      form.value = {
        nombre: "",
        precio: 0,
        categoria_id: null,
        activo: true,
        sinonimos: [],
      };
      synonymsText.value = "";
      showModal.value = true;
    }

    function edit(prod) {
      editing.value = true;
      form.value = { ...prod, sinonimos: prod.sinonimos || [] };
      synonymsText.value = (prod.sinonimos || []).join(", ");
      showModal.value = true;
    }

    function cancel() {
      showModal.value = false;
      form.value = { sinonimos: [] };
      editing.value = false;
    }

    async function save() {
      form.value.sinonimos = synonymsText.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (editing.value) {
        await productsStore.updateProduct(form.value.id, form.value);
      } else {
        await productsStore.createProduct(form.value);
      }
      await productsStore.fetchProducts(true);
      products.value = productsStore.products;
      cancel();
    }

    async function remove(id) {
      if (confirm("¿Eliminar producto?")) {
        await productsStore.deleteProduct(id);
        await productsStore.fetchProducts(true);
        products.value = productsStore.products;
      }
    }

    const fileInput = ref(null);

    function triggerFileInput() {
      fileInput.value && fileInput.value.click();
    }

    async function handleFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        // assuming backend provides CLI; here we just send to a custom endpoint for convenience
        const { error } = await apiHelpers.post("/api/admin/catalog/import", {
          catalog: json,
        });
        if (error) {
          alert("Error al importar: " + error);
        } else {
          alert("Importación iniciada, refresca para ver los cambios");
          await load();
        }
      } catch (err) {
        alert("Formato inválido: " + err.message);
      }
    }

    async function downloadCatalog() {
      await categoriesStore.fetchCategories();
      await productsStore.fetchProducts();
      const blob = new Blob(
        [
          JSON.stringify(
            {
              categories: categoriesStore.categories,
              products: productsStore.products,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "catalog.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    return {
      products,
      categories,
      showModal,
      editing,
      form,
      synonymsText,
      startNew,
      edit,
      cancel,
      save,
      remove,
      fileInput,
      triggerFileInput,
      handleFile,
      downloadCatalog,
    };
  },
};
</script>

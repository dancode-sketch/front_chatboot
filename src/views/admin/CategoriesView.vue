<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Categorías del catálogo</h1>
    <button
      class="btn btn-primary mb-2"
      @click="newCategory = { nombre: '', orden: 0, activo: true }"
    >
      Nueva categoría
    </button>

    <table class="min-w-full table-auto">
      <thead>
        <tr>
          <th class="border px-2 py-1">Nombre</th>
          <th class="border px-2 py-1">Orden</th>
          <th class="border px-2 py-1">Activo</th>
          <th class="border px-2 py-1">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cat in categories" :key="cat.id">
          <td>{{ cat.nombre }}</td>
          <td>{{ cat.orden }}</td>
          <td>{{ cat.activo ? "Sí" : "No" }}</td>
          <td>
            <button class="text-blue-500" @click="edit(cat)">Editar</button>
            <button class="text-red-500" @click="remove(cat.id)">
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- modal simple para crear/editar -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
    >
      <div class="bg-white p-4 rounded w-96">
        <h2 class="font-bold mb-2">
          {{ editing ? "Editar" : "Nueva" }} categoría
        </h2>
        <div class="mb-2">
          <label for="cat-name">Nombre</label>
          <input
            id="cat-name"
            v-model="form.nombre"
            class="w-full border px-1 py-0.5"
          />
        </div>
        <div class="mb-2">
          <label for="cat-orden">Orden</label>
          <input
            id="cat-orden"
            type="number"
            v-model.number="form.orden"
            class="w-full border px-1 py-0.5"
          />
        </div>
        <div class="mb-2">
          <label for="cat-activo">
            <input id="cat-activo" type="checkbox" v-model="form.activo" />
            Activo
          </label>
        </div>
        <button class="btn btn-primary mr-2" @click="save">Guardar</button>
        <button class="btn" @click="cancel">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useCategoriesStore } from "@/stores/categories";

export default {
  setup() {
    const store = useCategoriesStore();
    const categories = ref([]);

    const newCategory = ref(null);
    const editing = ref(false);
    const form = ref({});
    const showModal = ref(false);

    store.fetchCategories().then(() => {
      categories.value = store.categories;
    });

    function edit(cat) {
      editing.value = true;
      form.value = { ...cat };
      showModal.value = true;
    }

    function cancel() {
      showModal.value = false;
      form.value = {};
      editing.value = false;
    }

    async function save() {
      if (editing.value) {
        await store.updateCategory(form.value.id, form.value);
      } else {
        await store.createCategory(form.value);
      }
      await store.fetchCategories();
      categories.value = store.categories;
      cancel();
    }

    async function remove(id) {
      if (confirm("¿Eliminar categoría?")) {
        await store.deleteCategory(id);
        await store.fetchCategories();
        categories.value = store.categories;
      }
    }

    return {
      categories,
      newCategory,
      editing,
      form,
      showModal,
      edit,
      cancel,
      save,
      remove,
    };
  },
};
</script>

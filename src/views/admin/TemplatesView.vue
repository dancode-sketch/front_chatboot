<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Plantillas de mensajes</h1>
    <button class="btn btn-primary mb-2" @click="startNew">
      Nueva plantilla
    </button>

    <table class="min-w-full table-auto">
      <thead>
        <tr>
          <th class="border px-2 py-1">Nombre</th>
          <th class="border px-2 py-1">Cuerpo</th>
          <th class="border px-2 py-1">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tpl in templates" :key="tpl.id">
          <td>{{ tpl.nombre }}</td>
          <td>{{ tpl.cuerpo }}</td>
          <td>
            <button class="text-blue-500" @click="edit(tpl)">Editar</button>
            <button class="text-red-500" @click="remove(tpl.id)">
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
      <div class="bg-white p-4 rounded w-96">
        <h2 class="font-bold mb-2">
          {{ editing ? "Editar" : "Nueva" }} plantilla
        </h2>
        <div class="mb-2">
          <label for="tpl-nombre">Nombre</label>
          <input
            id="tpl-nombre"
            v-model="form.nombre"
            class="w-full border px-1 py-0.5"
          />
        </div>
        <div class="mb-2">
          <label for="tpl-cuerpo">Cuerpo</label>
          <textarea
            id="tpl-cuerpo"
            v-model="form.cuerpo"
            class="w-full border px-1 py-0.5"
            rows="4"
          ></textarea>
        </div>
        <button class="btn btn-primary mr-2" @click="save">Guardar</button>
        <button class="btn" @click="cancel">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useTemplatesStore } from "@/stores/templates";

export default {
  setup() {
    const store = useTemplatesStore();
    const templates = ref([]);
    const showModal = ref(false);
    const editing = ref(false);
    const form = ref({});

    async function load() {
      await store.fetchTemplates();
      templates.value = store.templates;
    }
    load();

    function startNew() {
      editing.value = false;
      form.value = { nombre: "", cuerpo: "" };
      showModal.value = true;
    }

    function edit(tpl) {
      editing.value = true;
      form.value = { ...tpl };
      showModal.value = true;
    }

    function cancel() {
      showModal.value = false;
      form.value = {};
      editing.value = false;
    }

    async function save() {
      if (editing.value) {
        await store.updateTemplate(form.value.id, form.value);
      } else {
        await store.createTemplate(form.value);
      }
      await load();
      cancel();
    }

    async function remove(id) {
      if (confirm("¿Eliminar plantilla?")) {
        await store.deleteTemplate(id);
        await load();
      }
    }

    return {
      templates,
      showModal,
      editing,
      form,
      startNew,
      edit,
      cancel,
      save,
      remove,
    };
  },
};
</script>

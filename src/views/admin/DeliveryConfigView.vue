<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Configuración de tarifas de delivery</h1>
    <div v-if="loading" class="text-gray-600">Cargando...</div>
    <div v-else>
      <div class="mb-2">
        <label for="del-base">Base</label>
        <input
          id="del-base"
          type="number"
          step="0.01"
          v-model.number="form.base"
          class="w-full border px-1 py-0.5"
        />
      </div>
      <div class="mb-2">
        <label for="del-por-km">Por km</label>
        <input
          id="del-por-km"
          type="number"
          step="0.01"
          v-model.number="form.por_km"
          class="w-full border px-1 py-0.5"
        />
      </div>
      <div class="mb-2">
        <label for="del-gratis">Gratis desde</label>
        <input
          id="del-gratis"
          type="number"
          step="0.01"
          v-model.number="form.gratis_desde"
          class="w-full border px-1 py-0.5"
        />
      </div>
      <div class="mb-2">
        <label for="del-max-km">Max km</label>
        <input
          id="del-max-km"
          type="number"
          step="0.1"
          v-model.number="form.max_km"
          class="w-full border px-1 py-0.5"
        />
      </div>
      <button class="btn btn-primary" @click="save">Guardar</button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useDeliveryStore } from "@/stores/delivery";

export default {
  setup() {
    const store = useDeliveryStore();
    const loading = ref(false);
    const form = ref({ base: 0, por_km: 0, gratis_desde: 0, max_km: 0 });

    async function load() {
      loading.value = true;
      const { data } = await store.fetchConfig();
      if (data) {
        Object.assign(form.value, data);
      }
      loading.value = false;
    }

    async function save() {
      await store.updateConfig(form.value);
      // puedes mostrar toast
    }

    load();

    return {
      loading,
      form,
      save,
    };
  },
};
</script>

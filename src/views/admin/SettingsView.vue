<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Configuraciones dinámicas</h1>
    <div v-if="loading" class="text-gray-600">Cargando...</div>
    <table v-else class="min-w-full table-auto">
      <thead>
        <tr>
          <th class="border px-2 py-1">Key</th>
          <th class="border px-2 py-1">Valor</th>
          <th class="border px-2 py-1">Tipo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="setting in settings" :key="setting.key">
          <td class="border px-2 py-1">{{ setting.key }}</td>
          <td class="border px-2 py-1">
            <input
              v-model="values[setting.key]"
              :type="inputType(setting.type)"
              class="w-full border rounded px-1 py-0.5"
            />
          </td>
          <td class="border px-2 py-1">{{ setting.type }}</td>
        </tr>
      </tbody>
    </table>
    <button class="mt-4 btn btn-primary" @click="save" :disabled="loading">
      Guardar cambios
    </button>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { SETTING_TYPES } from "@/utils/constants";

function inputType(type) {
  switch (type) {
    case SETTING_TYPES.BOOL:
      return "checkbox";
    case SETTING_TYPES.INT:
    case SETTING_TYPES.FLOAT:
      return "number";
    default:
      return "text";
  }
}

export default {
  setup() {
    const store = useSettingsStore();
    const loading = computed(() => store.loading);
    const settings = computed(() => store.settings);

    const values = ref({});

    watch(
      settings,
      (newSettings) => {
        const obj = {};
        newSettings.forEach((s) => {
          obj[s.key] = s.value;
        });
        values.value = obj;
      },
      { immediate: true },
    );

    async function save() {
      const payload = Object.keys(values.value).map((k) => ({
        key: k,
        value: values.value[k],
      }));
      await store.updateSettings(payload);
      // opcional: mostrar toast de éxito
    }

    // fetch initially
    store.fetchSettings();

    return {
      loading,
      settings,
      values,
      inputType,
      save,
    };
  },
};
</script>

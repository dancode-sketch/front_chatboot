<template>
  <div class="bg-white border-t border-gray-200 p-3 md:p-4">
    <form
      @submit.prevent="handleSubmit"
      class="flex items-end space-x-2 md:space-x-3"
    >
      <!-- Textarea -->
      <div class="flex-1">
        <textarea
          v-model="mensaje"
          ref="textareaRef"
          rows="1"
          :disabled="disabled"
          @keydown.enter.exact.prevent="handleSubmit"
          @keydown.shift.enter="handleShiftEnter"
          @input="autoResize"
          placeholder="Escribe un mensaje..."
          class="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none scrollbar-thin disabled:opacity-50 disabled:cursor-not-allowed"
          style="max-height: 120px"
        ></textarea>
      </div>

      <!-- Botón Enviar -->
      <button
        type="submit"
        :disabled="disabled || !mensaje.trim()"
        class="px-4 md:px-6 py-2 bg-primary hover:bg-green-600 text-white font-medium text-sm md:text-base rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <span class="hidden sm:inline">Enviar</span>
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </form>

    <!-- Hint - Oculto en móvil -->
    <div class="mt-2 text-xs text-gray-500 hidden md:block">
      <kbd class="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded"
        >Enter</kbd
      >
      para enviar •
      <kbd class="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded"
        >Shift + Enter</kbd
      >
      para nueva línea
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["enviar"]);

const mensaje = ref("");
const textareaRef = ref(null);

function handleSubmit() {
  if (!mensaje.value.trim()) return;

  emit("enviar", mensaje.value);
  mensaje.value = "";

  // Resetear altura del textarea
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = "auto";
    }
  });
}

function handleShiftEnter(event) {
  // Permitir que Shift+Enter agregue nueva línea
  // El comportamiento por defecto se maneja automáticamente
}

function autoResize(event) {
  const textarea = event.target;
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
}
</script>

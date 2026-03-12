<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
        @click="close"
      >
        <div class="absolute top-4 right-4 flex space-x-2">
          <!-- Zoom Out -->
          <button
            @click.stop="zoomOut"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition"
            title="Zoom out"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            </svg>
          </button>

          <!-- Zoom In -->
          <button
            @click.stop="zoomIn"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition"
            title="Zoom in"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </button>

          <!-- Reset Zoom -->
          <button
            @click.stop="resetZoom"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition"
            title="Reset zoom"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <!-- Close -->
          <button
            @click.stop="close"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition"
            title="Cerrar"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Nivel de Zoom -->
        <div
          class="absolute top-4 left-4 bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm"
        >
          {{ Math.round(scale * 100) }}%
        </div>

        <!-- Contenedor de imagen con scroll -->
        <div class="max-w-full max-h-full overflow-auto p-8" @click.stop>
          <img
            :src="imageUrl"
            :alt="caption"
            :style="{
              transform: `scale(${scale})`,
              transition: 'transform 0.3s ease',
              cursor: isDragging ? 'grabbing' : 'grab',
            }"
            class="max-w-none"
            draggable="false"
            @mousedown="startDrag"
            @mousemove="drag"
            @mouseup="stopDrag"
            @mouseleave="stopDrag"
          />
        </div>

        <!-- Caption si existe -->
        <div
          v-if="caption"
          class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg max-w-2xl text-center"
        >
          {{ caption }}
        </div>

        <!-- Ayuda -->
        <div
          class="absolute bottom-4 right-4 bg-white bg-opacity-20 text-white text-xs px-3 py-1 rounded"
        >
          Rueda del ratón para zoom | ESC para cerrar
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  caption: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close"]);

// Estado del zoom
const scale = ref(1);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

// Funciones de zoom
function zoomIn() {
  scale.value = Math.min(scale.value + 0.25, 5);
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.25, 0.5);
}

function resetZoom() {
  scale.value = 1;
}

// Cerrar modal
function close() {
  emit("close");
  resetZoom();
}

// Drag para mover imagen cuando está con zoom
function startDrag(e) {
  if (scale.value > 1) {
    isDragging.value = true;
    dragStart.value = { x: e.clientX, y: e.clientY };
  }
}

function drag(e) {
  if (isDragging.value) {
    // Implementación básica - se puede mejorar
    // Para un drag completo necesitaríamos manejar el scroll del contenedor
  }
}

function stopDrag() {
  isDragging.value = false;
}

// Soporte para rueda del ratón (zoom)
function handleWheel(e) {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
}

// Watch para agregar/quitar event listeners
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      // Agregar listeners
      document.addEventListener("keydown", handleKeydown);
      document.addEventListener("wheel", handleWheel, { passive: false });
      // Prevenir scroll del body
      document.body.style.overflow = "hidden";
    } else {
      // Remover listeners
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("wheel", handleWheel);
      // Restaurar scroll del body
      document.body.style.overflow = "";
    }
  },
);

// Cerrar con ESC
function handleKeydown(e) {
  if (e.key === "Escape") {
    close();
  } else if (e.key === "+" || e.key === "=") {
    zoomIn();
  } else if (e.key === "-") {
    zoomOut();
  } else if (e.key === "0") {
    resetZoom();
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

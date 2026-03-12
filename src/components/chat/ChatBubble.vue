<template>
  <div
    class="flex mb-2"
    :class="mensaje.es_bot_o_humano ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow"
      :class="bubbleClass"
    >
      <!-- TEXTO -->
      <div
        v-if="mensaje.tipo === 'texto'"
        class="whitespace-pre-wrap break-words"
      >
        {{ mensaje.contenido }}
      </div>

      <!-- IMAGEN -->
      <div v-else-if="mensaje.tipo === 'imagen'" class="space-y-2">
        <div v-if="mediaUrl" class="relative cursor-pointer group">
          <img
            :src="mediaUrl"
            :alt="mediaContent?.caption || 'Imagen'"
            class="rounded-lg max-w-full h-auto transition-opacity"
            loading="lazy"
            @click="openImageViewer"
          />
          <!-- Overlay con icono de zoom -->
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center"
            @click="openImageViewer"
          >
            <svg
              class="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
          </div>
        </div>
        <div v-else class="flex items-center space-x-2 text-sm">
          <Camera :size="18" />
          <span>Imagen no disponible</span>
        </div>
        <p v-if="mediaContent?.caption" class="text-sm mt-2">
          {{ mediaContent.caption }}
        </p>
      </div>

      <!-- AUDIO -->
      <div v-else-if="mensaje.tipo === 'audio'" class="space-y-2">
        <div class="flex items-center space-x-2 mb-2">
          <Mic :size="18" />
          <span class="text-sm font-medium">Nota de voz</span>
        </div>
        <audio v-if="mediaUrl" controls class="w-full">
          <source
            :src="mediaUrl"
            :type="mediaContent?.mime_type || 'audio/ogg'"
          />
          Tu navegador no soporta audio.
        </audio>
        <div v-else class="text-sm text-gray-500">Audio no disponible</div>
      </div>

      <!-- VIDEO -->
      <div v-else-if="mensaje.tipo === 'video'" class="space-y-2">
        <video v-if="mediaUrl" controls class="rounded-lg max-w-full">
          <source
            :src="mediaUrl"
            :type="mediaContent?.mime_type || 'video/mp4'"
          />
          Tu navegador no soporta video.
        </video>
        <div v-else class="flex items-center space-x-2 text-sm">
          <Video :size="18" />
          <span>Video no disponible</span>
        </div>
        <p v-if="mediaContent?.caption" class="text-sm mt-2">
          {{ mediaContent.caption }}
        </p>
      </div>

      <!-- DOCUMENTO -->
      <div v-else-if="mensaje.tipo === 'documento'" class="space-y-2">
        <div class="flex items-center space-x-2">
          <FileText :size="24" />
          <div class="flex-1">
            <p class="text-sm font-medium">
              {{ mediaContent?.filename || "Documento" }}
            </p>
            <p v-if="mediaContent?.mime_type" class="text-xs text-gray-500">
              {{ mediaContent.mime_type }}
            </p>
          </div>
        </div>
        <a
          v-if="mediaUrl"
          :href="mediaUrl"
          :download="mediaContent?.filename"
          target="_blank"
          class="inline-block text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Descargar documento
        </a>
        <span v-else class="text-sm text-gray-500">
          Documento no disponible
        </span>
        <p v-if="mediaContent?.caption" class="text-sm mt-2">
          {{ mediaContent.caption }}
        </p>
      </div>

      <!-- UBICACIÓN -->
      <div v-else-if="mensaje.tipo === 'ubicacion'" class="space-y-2">
        <div class="flex items-center space-x-2 mb-2">
          <MapPin :size="20" />
          <span class="text-sm font-medium">Ubicación compartida</span>
        </div>
        <a
          v-if="locationData"
          :href="googleMapsUrl"
          target="_blank"
          class="inline-block text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Ver en Google Maps
        </a>
        <p v-if="locationData?.name" class="text-sm mt-1">
          {{ locationData.name }}
        </p>
        <p v-if="locationData?.address" class="text-xs text-gray-500">
          {{ locationData.address }}
        </p>
      </div>

      <!-- ORDEN/PEDIDO -->
      <div v-else-if="mensaje.tipo === 'orden'" class="space-y-2">
        <div class="flex items-center space-x-2 mb-2">
          <ShoppingCart :size="20" />
          <span class="text-sm font-medium">Pedido confirmado</span>
        </div>
        <div class="text-sm">{{ mensaje.contenido }}</div>
      </div>

      <!-- TIPO DESCONOCIDO -->
      <div v-else class="text-sm">
        {{ mensaje.contenido }}
      </div>

      <!-- Timestamp -->
      <div class="text-xs opacity-60 mt-2 text-right">
        {{ formatTime(mensaje.fecha) }}
      </div>
    </div>

    <!-- Visualizador de Imágenes -->
    <ImageViewer
      :is-open="showImageViewer"
      :image-url="mediaUrl"
      :caption="mediaContent?.caption || ''"
      @close="closeImageViewer"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  Camera,
  Mic,
  Video,
  FileText,
  MapPin,
  ShoppingCart,
} from "lucide-vue-next";
import { useMedia } from "@/composables/useMedia";
import {
  formatTime,
  parseLocation,
  getGoogleMapsUrl,
} from "@/utils/formatters";
import ImageViewer from "./ImageViewer.vue";

const props = defineProps({
  mensaje: {
    type: Object,
    required: true,
  },
});

const { getMediaUrl } = useMedia();

// Estado reactivo para la URL del media (ahora async)
const mediaUrl = ref(null);
const loadingMedia = ref(false);

// Estado para el visualizador de imágenes
const showImageViewer = ref(false);

function openImageViewer() {
  showImageViewer.value = true;
}

function closeImageViewer() {
  showImageViewer.value = false;
}

const bubbleClass = computed(() => {
  if (props.mensaje.es_bot_o_humano) {
    // Nuestros mensajes (bot o humano)
    return "bg-green-100 text-gray-900";
  } else {
    // Mensajes del cliente
    return "bg-white text-gray-900 border border-gray-200";
  }
});

// Parsear contenido multimedia
const mediaContent = computed(() => {
  if (["imagen", "audio", "video", "documento"].includes(props.mensaje.tipo)) {
    console.log("[ChatBubble] Mensaje multimedia detectado:", {
      tipo: props.mensaje.tipo,
      contenido: props.mensaje.contenido,
      esString: typeof props.mensaje.contenido === "string",
    });

    try {
      const parsed =
        typeof props.mensaje.contenido === "string"
          ? JSON.parse(props.mensaje.contenido)
          : props.mensaje.contenido;

      console.log("[ChatBubble] Contenido parseado:", parsed);
      return parsed;
    } catch (error) {
      console.error(
        "[ChatBubble] Error parseando contenido multimedia:",
        error,
      );
      return null;
    }
  }
  return null;
});

// Cargar URL del multimedia (async)
async function loadMediaUrl() {
  if (!mediaContent.value?.media_id) {
    mediaUrl.value = null;
    return;
  }

  loadingMedia.value = true;
  console.log("[ChatBubble] Cargando media:", mediaContent.value.media_id);

  try {
    const url = await getMediaUrl(mediaContent.value.media_id);
    mediaUrl.value = url;
    console.log("[ChatBubble] Media cargada:", url ? "OK" : "FAILED");
  } catch (error) {
    console.error("[ChatBubble] Error cargando media:", error);
    mediaUrl.value = null;
  } finally {
    loadingMedia.value = false;
  }
}

// Cargar media cuando el componente se monta
onMounted(() => {
  if (mediaContent.value?.media_id) {
    loadMediaUrl();
  }
});

// Recargar si el contenido cambia
watch(
  () => mediaContent.value?.media_id,
  (newMediaId) => {
    if (newMediaId) {
      loadMediaUrl();
    } else {
      mediaUrl.value = null;
    }
  },
);

// Parsear ubicación
const locationData = computed(() => {
  if (props.mensaje.tipo === "ubicacion") {
    return parseLocation(props.mensaje.contenido);
  }
  return null;
});

const googleMapsUrl = computed(() => {
  if (locationData.value) {
    return getGoogleMapsUrl(
      locationData.value.latitude,
      locationData.value.longitude,
    );
  }
  return "#";
});
</script>

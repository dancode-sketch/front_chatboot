<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <!-- Logo y Título -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4"
        >
          <svg
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Restaurante
        </h1>
        <p class="text-gray-600">Sistema de Gestión de Pedidos y Chat</p>
      </div>

      <!-- Formulario de Login -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <form @submit.prevent="handleLogin">
          <div class="space-y-6">
            <!-- Username -->
            <div>
              <label
                for="username"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Usuario o Email
              </label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="admin"
                :disabled="loading"
              />
            </div>

            <!-- Password -->
            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="mostrarPassword ? 'text' : 'password'"
                  required
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="••••••••"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="mostrarPassword = !mostrarPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabindex="-1"
                >
                  <svg
                    v-if="mostrarPassword"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                  <svg
                    v-else
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              {{ errorMessage }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-primary hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <span v-if="!loading">Iniciar Sesión</span>
              <span v-else class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Iniciando sesión...
              </span>
            </button>
          </div>
        </form>

        <!-- Credenciales por defecto -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p
            class="text-xs text-blue-800 font-medium mb-1 flex items-center gap-1"
          >
            <Info :size="14" /> Credenciales por defecto:
          </p>
          <p class="text-xs text-blue-700">
            <span class="font-mono">admin</span> /
            <span class="font-mono">admin123</span>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center text-sm text-gray-600">
        <p>
          &copy; 2026 Sistema de Restaurante. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { Info } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotify } from "@/composables/useNotify";

const router = useRouter();
const authStore = useAuthStore();
const notify = useNotify();

const form = reactive({
  username: "",
  password: "",
});

const mostrarPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");

async function handleLogin() {
  errorMessage.value = "";
  loading.value = true;

  try {
    const { success, error } = await authStore.login(
      form.username,
      form.password,
    );

    if (success) {
      notify.success("¡Bienvenido!");
      router.push("/dashboard/kds");
    } else {
      errorMessage.value = error || "Error al iniciar sesión";
    }
  } catch (error) {
    errorMessage.value = "Error de conexión con el servidor";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <!-- Overlay para móvil -->
  <div
    v-if="isOpen"
    @click="$emit('close')"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
  ></div>

  <aside
    class="fixed w-64 bg-white border-r border-gray-200 flex flex-col h-full z-50 transition-transform duration-300"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Logo -->
    <div class="h-16 flex items-center px-6 border-b border-gray-200">
      <div class="flex items-center">
        <div
          class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
        >
          <svg
            class="w-5 h-5 text-white"
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
        <span class="ml-3 font-bold text-gray-900">Dashboard</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin">
      <!-- 1. OPERACIONES & COCINA -->
      <div>
        <h3 class="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Cocina & Operaciones
        </h3>
        <div class="space-y-1">
          <!-- KDS (ADMIN, COCINA, CAJERO) -->
          <RouterLink
            v-if="authStore.hasAnyRole(['ADMIN', 'COCINA', 'CAJERO'])"
            to="/dashboard/kds"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/dashboard/kds') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>KDS - Cocina</span>
            <span v-if="pedidosPendientes > 0" class="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {{ pedidosPendientes }}
            </span>
          </RouterLink>

          <!-- Chat WhatsApp (solo ADMIN) -->
          <RouterLink
            v-if="authStore.hasRole('ADMIN')"
            to="/dashboard/chat"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/dashboard/chat') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Chat WhatsApp</span>
            <span v-if="mensajesStore.mensajesSinLeer > 0" class="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {{ mensajesStore.mensajesSinLeer }}
            </span>
          </RouterLink>
        </div>
      </div>

      <!-- 2. SALÓN & VENTAS (POS) -->
      <div v-if="authStore.hasAnyRole(['ADMIN', 'MESERO', 'CAJERO'])">
        <h3 class="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Salón & Ventas
        </h3>
        <div class="space-y-1">
          <RouterLink
            to="/pos/mapa"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/pos/mapa') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Mapa de Mesas</span>
          </RouterLink>

          <RouterLink
            to="/pos/nueva-orden"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/pos/nueva-orden') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Tomar Pedido</span>
          </RouterLink>

          <RouterLink
            to="/dashboard/pedidos"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/dashboard/pedidos') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Historial Pedidos</span>
          </RouterLink>
        </div>
      </div>

      <!-- 3. CAJA & FINANZAS (ADMIN, CAJERO) -->
      <div v-if="authStore.hasAnyRole(['ADMIN', 'CAJERO'])">
        <h3 class="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Finanzas
        </h3>
        <div class="space-y-1">
          <RouterLink
            to="/dashboard/caja"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/dashboard/caja') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Flujo de Caja</span>
            <span
              class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
              :class="cajaStore.isCajaAbierta ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
            >
              {{ cajaStore.isCajaAbierta ? 'Abierta' : 'Cerrada' }}
            </span>
          </RouterLink>
        </div>
      </div>

      <!-- 4. DELIVERY & ENVIOS (ADMIN) -->
      <div v-if="authStore.isAdmin || authStore.hasRole('ADMIN')">
        <h3 class="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Delivery & Envíos
        </h3>
        <div class="space-y-1">
          <RouterLink
            to="/admin/asignacion-pedidos"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/admin/asignacion-pedidos') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h1m0 0l2.5 11.5M5 3h14a1 1 0 011 1v10a1 1 0 01-1 1h-4.5" />
            </svg>
            <span>Asignar Pedidos</span>
          </RouterLink>

          <RouterLink
            to="/admin/motorizados"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/admin/motorizados') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Motorizados</span>
          </RouterLink>

          <RouterLink
            to="/admin/delivery"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/admin/delivery') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Tarifas & Cobertura</span>
          </RouterLink>

          <a
            href="/motorizado/login"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium mt-1"
          >
            <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Portal Móvil Repartidor ↗</span>
          </a>
        </div>
      </div>

      <!-- 5. ALMACÉN & INVENTARIO (ADMIN, COCINA) -->
      <div v-if="authStore.hasAnyRole(['ADMIN', 'COCINA'])">
        <h3 class="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Almacén & Inventario
        </h3>
        <div class="space-y-1">
          <RouterLink
            to="/admin/inventario/insumos"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/admin/inventario/insumos') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Stock de Insumos</span>
          </RouterLink>

          <RouterLink
            to="/admin/inventario/recetas"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/admin/inventario/recetas') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Recetarios (BOM)</span>
          </RouterLink>

          <RouterLink
            to="/admin/inventario/movimientos"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/admin/inventario/movimientos') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Entradas y Mermas</span>
          </RouterLink>
        </div>
      </div>

      <!-- 6. CARTA & MENÚ (ADMIN) -->
      <div v-if="authStore.hasRole('ADMIN')">
        <h3 class="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Carta & Menú
        </h3>
        <div class="space-y-1">
          <RouterLink
            to="/admin/catalog/products"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/admin/catalog/products') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Productos</span>
          </RouterLink>

          <RouterLink
            to="/admin/catalog/categories"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/admin/catalog/categories') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Categorías</span>
          </RouterLink>

          <RouterLink
            to="/admin/modificadores"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/admin/modificadores') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Modificadores</span>
          </RouterLink>
        </div>
      </div>

      <!-- 7. CONFIGURACIÓN (ADMIN) -->
      <div v-if="authStore.hasRole('ADMIN')">
        <h3 class="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Configuración
        </h3>
        <div class="space-y-1">
          <RouterLink
            to="/admin/mesas"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/admin/mesas') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Mesas / Zonas</span>
          </RouterLink>

          <RouterLink
            to="/admin/templates"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/admin/templates') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span>Plantillas Bot</span>
          </RouterLink>

          <RouterLink
            to="/admin/settings"
            @click="$emit('close')"
            class="flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            :class="isActive('/admin/settings') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Ajustes Generales</span>
          </RouterLink>
        </div>
      </div>
    </nav>


    <!-- Connection Status -->
    <div class="px-6 py-4 border-t border-gray-200">
      <div
        class="flex items-center text-xs"
        :class="wsConnected ? 'text-green-600' : 'text-red-600'"
      >
        <div
          class="w-2 h-2 rounded-full mr-2"
          :class="wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
        ></div>
        <span>{{ wsConnected ? "Conectado" : "Desconectado" }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { usePedidosStore } from "@/stores/pedidos";
import { useWebSocketStore } from "@/stores/websocket";
import { useMensajesStore } from "@/stores/mensajes";
import { useAuthStore } from "@/stores/auth";
import { useCajaStore } from "@/stores/caja";
import { ESTADO_PEDIDO } from "@/utils/constants";

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close"]);

const route = useRoute();
const mensajesStore = useMensajesStore();
const pedidosStore = usePedidosStore();
const wsStore = useWebSocketStore();

const authStore = useAuthStore();
const cajaStore = useCajaStore();

const pedidosPendientes = computed(
  () => pedidosStore.pedidosPorEstado(ESTADO_PEDIDO.PENDIENTE).length,
);
const wsConnected = computed(() => wsStore.connected);

onMounted(() => {
  cajaStore.verificarEstadoCaja();
});

function isActive(path) {
  return route.path === path;
}
</script>

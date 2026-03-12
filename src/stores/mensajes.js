import { ref } from "vue";
import { defineStore } from "pinia";
import { apiClient } from "@/composables/useApi";

export const useMensajesStore = defineStore("mensajes", () => {
  const mensajesSinLeer = ref(0);
  const clientesConMensajesSinLeer = ref([]);

  // Obtener estadísticas de mensajes sin leer
  const cargarMensajesSinLeer = async () => {
    try {
      const response = await apiClient.get(
        "/api/clientes/estadisticas/mensajes-sin-leer"
      );
      
      const data = response.data;
      mensajesSinLeer.value = data.total_sin_leer;
      clientesConMensajesSinLeer.value = data.clientes_con_mensajes_sin_leer;

      console.log(`📊 Mensajes sin leer: ${mensajesSinLeer.value}`);
    } catch (error) {
      console.error("Error cargando mensajes sin leer:", error.message);
    }
  };

  // Incrementar contador cuando llega mensaje nuevo
  const incrementarSinLeer = (clienteId) => {
    mensajesSinLeer.value++;

    // Actualizar o agregar cliente a la lista sin hacer petición de red
    const clienteExistente = clientesConMensajesSinLeer.value.find(
      (c) => c.cliente_id === clienteId,
    );

    if (clienteExistente) {
      clienteExistente.cantidad_sin_leer++;
    } else {
      // Agregar nuevo cliente localmente; el contador global ya fue incrementado
      clientesConMensajesSinLeer.value.push({
        cliente_id: clienteId,
        cantidad_sin_leer: 1
      });
      // opcional: podríamos solicitar estadísticas eventualmente si hay discrepancia
    }
  };

  // Marcar mensajes como leídos cuando se abre un chat
  const marcarComoLeido = (clienteId) => {
    const cliente = clientesConMensajesSinLeer.value.find(
      (c) => c.cliente_id === clienteId,
    );

    if (cliente) {
      mensajesSinLeer.value -= cliente.cantidad_sin_leer;
      clientesConMensajesSinLeer.value =
        clientesConMensajesSinLeer.value.filter(
          (c) => c.cliente_id !== clienteId,
        );
    }
  };

  return {
    mensajesSinLeer,
    clientesConMensajesSinLeer,
    cargarMensajesSinLeer,
    incrementarSinLeer,
    marcarComoLeido,
  };
});
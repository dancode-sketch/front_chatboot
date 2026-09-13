<template>
  <div class="thermal-receipt" v-if="order">
    <!-- Header -->
    <div class="header">
      <div class="brand" v-if="type === 'precuenta'">Restaurante</div>
      <div class="title" v-if="type === 'comanda'">COMANDA</div>
      <div class="meta">
        <div v-if="type === 'comanda'" class="meta-row">
          <span class="meta-label">Mesa:</span>
          <span class="meta-value">{{ mesaLabel }}</span>
        </div>
        <div v-if="type === 'precuenta'" class="meta-row">
          <span class="meta-label">Cliente:</span>
          <span class="meta-value">{{ clienteLabel }}</span>
        </div>
        <div v-if="type === 'precuenta'" class="meta-row">
          <span class="meta-label">Pedido:</span>
          <span class="meta-value">#{{ order.id || order.pedido_id }}</span>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Items -->
    <div class="items">
      <div
        v-for="item in order.items || []"
        :key="item.id || item.producto_nombre || item.nombre"
        class="item"
      >
        <div class="item-line">
          <span class="item-qty">{{ itemQty(item) }}x</span>
          <span class="item-name">{{ itemName(item) }}</span>
          <span v-if="type === 'precuenta'" class="item-price">
            S/ {{ lineTotal(item).toFixed(2) }}
          </span>
        </div>

        <div v-if="item.modificadores?.length" class="item-mods">
          <div
            v-for="mod in item.modificadores"
            :key="mod.id || mod.nombre"
            class="item-mod"
          >
            + {{ mod.nombre }}
            <span
              v-if="type === 'precuenta' && mod.precio_extra"
              class="mod-price"
            >
              (S/ {{ Number(mod.precio_extra).toFixed(2) }})
            </span>
          </div>
        </div>

        <div v-if="item.notas" class="item-notes">{{ item.notas }}</div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Totals -->
    <div v-if="type === 'precuenta'" class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>S/ {{ subtotal.toFixed(2) }}</span>
      </div>
      <div class="totals-row">
        <span>IGV / Impuestos</span>
        <span>S/ {{ tax.toFixed(2) }}</span>
      </div>
      <div class="totals-row total">
        <span>Total</span>
        <span>S/ {{ total.toFixed(2) }}</span>
      </div>
    </div>

    <div class="footer">
      <div v-if="type === 'precuenta'" class="thank-you">
        Gracias por su preferencia
      </div>
      <div v-else class="thank-you">¡Buen trabajo, cocina! 🍳</div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from "vue";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    required: true,
    validator: (val) => ["comanda", "precuenta"].includes(val),
  },
});

const { order, type } = toRefs(props);

const mesaLabel = computed(() => {
  return order.value.mesa || order.value.table || order.value.mesa_id || "---";
});

const clienteLabel = computed(() => {
  return (
    order.value.cliente?.nombre ||
    order.value.cliente ||
    order.value.cliente_nombre ||
    "Cliente"
  );
});

const itemQty = (item) => {
  return Number(item.cantidad || item.cant || 0) || 0;
};

const itemName = (item) => {
  return item.nombre || item.producto_nombre || item.producto?.nombre || "Item";
};

const itemPrice = (item) => {
  // Prefer subtotal if already calculated
  if (item.subtotal) return Number(item.subtotal);
  const price = Number(item.precio || item.precio_unitario || 0);
  return price;
};

const lineTotal = (item) => {
  if (item.subtotal) return Number(item.subtotal);
  return itemQty(item) * itemPrice(item);
};

const subtotal = computed(() => {
  if (!order.value?.items?.length) return 0;
  if (typeof order.value.subtotal !== "undefined") {
    const parsed = Number(order.value.subtotal);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return order.value.items.reduce((acc, item) => acc + lineTotal(item), 0);
});

const total = computed(() => {
  const candidate =
    order.value.total ?? order.value.total_pedido ?? order.value.total_amount;
  if (typeof candidate === "number") return candidate;
  const parsed = Number(candidate);
  if (!Number.isNaN(parsed)) return parsed;
  return subtotal.value;
});

// For simplicity we assume tax is 0 if not provided.
const tax = computed(() => {
  const candidate = order.value.tax ?? order.value.impuestos;
  if (typeof candidate === "number") return candidate;
  const parsed = Number(candidate);
  if (!Number.isNaN(parsed)) return parsed;
  return 0;
});
</script>

<style>
/* Nota: el CSS para impresión se aplica globalmente */

@media print {
  @page {
    size: 80mm auto;
    margin: 0;
  }

  html,
  body {
    margin: 0;
    padding: 0;
  }

  /* Oculta todo menos el ticket */
  body * {
    visibility: hidden !important;
  }

  .thermal-receipt,
  .thermal-receipt * {
    visibility: visible !important;
  }

  .thermal-receipt {
    position: absolute;
    top: 0;
    left: 0;
    width: 80mm !important;
    padding: 6mm 4mm;
    box-sizing: border-box;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    color: #000;
    background: #fff;
    line-height: 1.2;
    font-size: 12px;
  }

  .thermal-receipt * {
    box-sizing: border-box;
  }
}

/* Pantalla: no se muestra dentro de la app */
.thermal-receipt {
  display: none;
}

@media print {
  .thermal-receipt {
    display: block;
  }
}

/* Estructura interna */
.thermal-receipt .header {
  text-align: center;
  margin-bottom: 6px;
}

.thermal-receipt .brand {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.thermal-receipt .title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.thermal-receipt .meta {
  font-size: 11px;
  margin-top: 2px;
}

.thermal-receipt .meta-row {
  display: flex;
  justify-content: space-between;
  padding: 1px 0;
}

.thermal-receipt .meta-label {
  font-weight: 600;
}

.thermal-receipt .divider {
  height: 1px;
  background: #000;
  opacity: 0.4;
  margin: 6px 0;
}

.thermal-receipt .items {
  font-size: 11px;
}

.thermal-receipt .item {
  margin-bottom: 4px;
}

.thermal-receipt .item-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.thermal-receipt .item-qty {
  width: 18px;
  font-weight: 700;
}

.thermal-receipt .item-name {
  flex: 1;
  margin: 0 4px;
}

.thermal-receipt .item-price {
  font-weight: 700;
}

.thermal-receipt .item-mods {
  padding-left: 16px;
  font-size: 10px;
  color: #333;
}

.thermal-receipt .item-mod {
  display: flex;
  justify-content: space-between;
}

.thermal-receipt .mod-price {
  font-weight: 600;
}

.thermal-receipt .item-notes {
  padding-left: 16px;
  font-size: 10px;
  color: #555;
}

.thermal-receipt .totals {
  font-size: 11px;
}

.thermal-receipt .totals-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.thermal-receipt .total {
  font-weight: 700;
  font-size: 12px;
}

.thermal-receipt .footer {
  margin-top: 8px;
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.03em;
}

.thermal-receipt .thank-you {
  font-weight: 600;
}
</style>

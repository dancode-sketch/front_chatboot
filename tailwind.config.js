/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10B981',      // Verde
        secondary: '#3B82F6',    // Azul
        danger: '#EF4444',       // Rojo
        warning: '#F59E0B',      // Naranja
        success: '#22C55E',      // Verde claro
        
        // Estados de pedidos
        pendiente: '#F59E0B',    // Amarillo
        preparando: '#3B82F6',   // Azul
        listo: '#10B981',        // Verde
        entregado: '#6B7280',    // Gris
        cancelado: '#EF4444'     // Rojo
      }
    },
  },
  plugins: [],
}

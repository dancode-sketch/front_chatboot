import { usePedidosStore } from './pedidos'

/**
 * useOrderStore es un alias unificado a usePedidosStore para garantizar
 * que todos los componentes y WebSockets compartan el mismo estado reactivo.
 */
export const useOrderStore = usePedidosStore
export default useOrderStore


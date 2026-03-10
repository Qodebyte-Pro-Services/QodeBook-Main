import { create } from 'zustand';
import { OrderTask } from './data/order-data';
import { StockTask } from './data/stock-management-data';

interface SelectedRowState {
  selectedOrder: OrderTask | null;
  setSelectedOrder: (order: OrderTask) => void;
  clearSelectedOrder: () => void;
}

interface ToggleTypes {
  toggleState: boolean;
  setToggleState: (state: boolean) => void
  clearToggleState: () => void
}

interface StockMovementData {
  stockMovements: StockTask[];
  setStockMovements: (movements: StockTask[]) => void;
}

export const useSelectedRowStore = create<SelectedRowState>((set) => ({
  selectedOrder: null,
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  clearSelectedOrder: () => set({ selectedOrder: null }),
}));

export const useToggleActions = create<ToggleTypes>((set) => ({
  toggleState: false,
  setToggleState: (state) => set({ toggleState: state }),
  clearToggleState: () => set({ toggleState: false })
}));

export const useStockMovementData = create<StockMovementData>((set) => ({
  stockMovements: [],
  setStockMovements: (movements) => set({ stockMovements: movements })
}));
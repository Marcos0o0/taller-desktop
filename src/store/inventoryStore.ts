import { create } from 'zustand';
import { Product } from '@api/inventory.api';

interface InventoryState {
  products: Product[];
  selectedProduct: Product | null;
  lowStockProducts: Product[];
  scannerEnabled: boolean;
  lastScannedCode: string | null;

  // Actions
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setLowStockProducts: (products: Product[]) => void;
  setScannerEnabled: (enabled: boolean) => void;
  setLastScannedCode: (code: string | null) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  clearSelection: () => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  products: [],
  selectedProduct: null,
  lowStockProducts: [],
  scannerEnabled: false,
  lastScannedCode: null,

  setProducts: (products) => set({ products }),
  
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  
  setLowStockProducts: (products) => set({ lowStockProducts: products }),
  
  setScannerEnabled: (enabled) => set({ scannerEnabled: enabled }),
  
  setLastScannedCode: (code) => set({ lastScannedCode: code }),
  
  addProduct: (product) =>
    set((state) => ({ products: [product, ...state.products] })),
  
  updateProduct: (id, updatedData) =>
    set((state) => ({
      products: state.products.map((p) =>
        p._id === id ? { ...p, ...updatedData } : p
      ),
      selectedProduct:
        state.selectedProduct?._id === id
          ? { ...state.selectedProduct, ...updatedData }
          : state.selectedProduct,
    })),
  
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p._id !== id),
      selectedProduct:
        state.selectedProduct?._id === id ? null : state.selectedProduct,
    })),
  
  clearSelection: () => set({ selectedProduct: null }),
}));
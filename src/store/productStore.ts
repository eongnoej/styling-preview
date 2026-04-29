import { create } from 'zustand'
import { Product } from '@/types/product'

interface ProductStore {
  product: Product | null
  loading: boolean
  error: string | null
  setProduct: (product: Product) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useProductStore = create<ProductStore>((set) => ({
  product: null,
  loading: false,
  error: null,
  setProduct: (product) => set({ product, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ product: null, loading: false, error: null }),
}))

export type ClothingCategory = 'top' | 'bottom' | 'outer'

export interface CategoryInfo {
  primary: ClothingCategory
  secondary: string // 블라우스, 청바지, 코트 등
}

export interface Product {
  url: string
  name: string
  price: number | string
  mainImage: string
  galleryImages: string[]
  category: CategoryInfo
  createdAt?: number
}

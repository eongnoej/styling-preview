import { Product } from './product'
import { BodyInfo } from './bodyInfo'

export interface PreviewResult {
  id: string
  product: Product
  bodyInfo: BodyInfo
  sourceImageUrl: string // base64 또는 blob URL
  resultImageUrl: string // Canvas 결과
  savedAt: number
  metadata: {
    processingTime: number // ms
    quality: 'low' | 'medium' | 'high'
  }
}

export interface OverlayParams {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
}

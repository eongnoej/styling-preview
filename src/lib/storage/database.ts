import Dexie, { Table } from 'dexie'

export interface StoredPreview {
  id: string
  productUrl: string
  productName: string
  productPrice: string | number
  category: string
  resultImageUrl: string // base64
  bodyInfo: {
    gender: string
    bodyType: string
    height: number
  }
  savedAt: number
  size?: number // bytes
}

export class StylingPreviewDB extends Dexie {
  previews!: Table<StoredPreview>

  constructor() {
    super('StylingPreviewDB')
    this.version(1).stores({
      previews: '++id, savedAt, productUrl',
    })
  }
}

export const db = new StylingPreviewDB()

/**
 * 저장된 모든 미리보기 조회
 */
export const getAllPreviews = async (): Promise<StoredPreview[]> => {
  try {
    return await db.previews.orderBy('savedAt').reverse().toArray()
  } catch (error) {
    console.error('Failed to get previews:', error)
    return []
  }
}

/**
 * ID로 미리보기 조회
 */
export const getPreviewById = async (id: string): Promise<StoredPreview | undefined> => {
  try {
    return await db.previews.get(id)
  } catch (error) {
    console.error('Failed to get preview:', error)
    return undefined
  }
}

/**
 * 새 미리보기 저장
 */
export const savePreview = async (preview: Omit<StoredPreview, 'id'>): Promise<string> => {
  try {
    const size = new Blob([preview.resultImageUrl]).size
    const id = await db.previews.add({
      ...preview,
      size,
    } as StoredPreview)
    console.log('✅ 미리보기 저장 완료:', id)
    return id.toString()
  } catch (error) {
    console.error('Failed to save preview:', error)
    throw new Error('미리보기 저장 실패')
  }
}

/**
 * 미리보기 삭제
 */
export const deletePreview = async (id: string): Promise<void> => {
  try {
    await db.previews.delete(parseInt(id))
    console.log('✅ 미리보기 삭제 완료:', id)
  } catch (error) {
    console.error('Failed to delete preview:', error)
    throw new Error('미리보기 삭제 실패')
  }
}

/**
 * 모든 미리보기 삭제
 */
export const deleteAllPreviews = async (): Promise<void> => {
  try {
    await db.previews.clear()
    console.log('✅ 모든 미리보기 삭제 완료')
  } catch (error) {
    console.error('Failed to delete all previews:', error)
    throw new Error('모든 미리보기 삭제 실패')
  }
}

/**
 * 저장된 미리보기 개수
 */
export const getPreviewCount = async (): Promise<number> => {
  try {
    return await db.previews.count()
  } catch (error) {
    console.error('Failed to get preview count:', error)
    return 0
  }
}

/**
 * 저장소 사용량 계산
 */
export const getStorageSize = async (): Promise<number> => {
  try {
    const previews = await db.previews.toArray()
    return previews.reduce((total, p) => total + (p.size || 0), 0)
  } catch (error) {
    console.error('Failed to get storage size:', error)
    return 0
  }
}

/**
 * 저장소 상태 확인
 */
export const getStorageStatus = async (): Promise<{
  count: number
  totalSize: number
  sizeInMB: number
}> => {
  const count = await getPreviewCount()
  const totalSize = await getStorageSize()
  const sizeInMB = totalSize / (1024 * 1024)

  return { count, totalSize, sizeInMB }
}

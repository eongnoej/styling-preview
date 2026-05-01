import { useEffect, useState } from 'react'
import {
  getAllPreviews,
  savePreview,
  deletePreview,
  getStorageStatus,
  NewStoredPreview,
  StoredPreview,
} from '@/lib/storage/database'

interface UseIndexedDBReturn {
  previews: StoredPreview[]
  loading: boolean
  error: string | null
  save: (preview: NewStoredPreview) => Promise<string>
  remove: (id: string) => Promise<void>
  refresh: () => Promise<void>
  storageStatus: {
    count: number
    totalSize: number
    sizeInMB: number
  } | null
}

export const useIndexedDB = (): UseIndexedDBReturn => {
  const [previews, setPreviews] = useState<StoredPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storageStatus, setStorageStatus] = useState<{
    count: number
    totalSize: number
    sizeInMB: number
  } | null>(null)

  // 초기 로드
  useEffect(() => {
    const loadPreviews = async () => {
      try {
        setLoading(true)
        const data = await getAllPreviews()
        setPreviews(data)

        const status = await getStorageStatus()
        setStorageStatus(status)

        setError(null)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '로드 실패'
        setError(errorMsg)
        setPreviews([])
      } finally {
        setLoading(false)
      }
    }

    loadPreviews()
  }, [])

  const save = async (preview: NewStoredPreview): Promise<string> => {
    try {
      const id = await savePreview(preview)

      // 목록 새로고침
      const data = await getAllPreviews()
      setPreviews(data)

      const status = await getStorageStatus()
      setStorageStatus(status)

      return id
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '저장 실패'
      setError(errorMsg)
      throw err
    }
  }

  const remove = async (id: string): Promise<void> => {
    try {
      await deletePreview(id)

      // 목록 새로고침
      const data = await getAllPreviews()
      setPreviews(data)

      const status = await getStorageStatus()
      setStorageStatus(status)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '삭제 실패'
      setError(errorMsg)
      throw err
    }
  }

  const refresh = async (): Promise<void> => {
    try {
      const data = await getAllPreviews()
      setPreviews(data)

      const status = await getStorageStatus()
      setStorageStatus(status)

      setError(null)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '새로고침 실패'
      setError(errorMsg)
    }
  }

  return {
    previews,
    loading,
    error,
    save,
    remove,
    refresh,
    storageStatus,
  }
}

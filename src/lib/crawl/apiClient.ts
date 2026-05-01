import axios from 'axios'
import { Product, CategoryInfo } from '@/types/product'

const API_BASE = '/api'

interface CrawlResponse {
  success: boolean
  data?: Product
  error?: unknown
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return '크롤링 중 오류가 발생했습니다'
}

export const crawlProduct = async (url: string): Promise<Product> => {
  try {
    const response = await axios.post<CrawlResponse>(`${API_BASE}/crawl`, {
      url,
    })

    if (!response.data.success || !response.data.data) {
      throw new Error(getErrorMessage(response.data.error))
    }

    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(getErrorMessage(error.response?.data?.error))
    }
    throw error
  }
}

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return (
      urlObj.hostname === '29cm.co.kr' ||
      urlObj.hostname === 'www.29cm.co.kr'
    ) && urlObj.pathname.startsWith('/products/')
  } catch {
    return false
  }
}

export const generateCategoryQuestion = (category: CategoryInfo): string => {
  const { secondary } = category
  const lastChar = secondary.charCodeAt(secondary.length - 1)
  // 한글 종성 판단 (아주 간단한 방식)
  const hasJongsung = (lastChar - 0xac00) % 28 > 0
  const particle = hasJongsung ? '이' : '가'
  return `${secondary}${particle} 맞으신가요?`
}

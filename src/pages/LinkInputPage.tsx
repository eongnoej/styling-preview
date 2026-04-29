import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductStore } from '@/store/productStore'
import { crawlProduct, validateUrl } from '@/lib/crawl/apiClient'

export default function LinkInputPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { setProduct, setError: setStoreError } = useProductStore()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError('링크를 입력해주세요')
      return
    }

    if (!validateUrl(url)) {
      setError('29cm 링크를 입력해주세요')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const product = await crawlProduct(url)
      setProduct(product)
      navigate('/category')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '크롤링 중 오류가 발생했습니다'
      setError(errorMsg)
      setStoreError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 단계 표시기 */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1
                  ? 'bg-white text-purple-600'
                  : 'bg-white bg-opacity-30 text-white'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        {/* 메인 카드 */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            스타일링 미리보기
          </h1>
          <p className="text-gray-600 mb-6">29cm 링크를 입력해주세요</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                29cm 상품 링크
              </label>
              <input
                type="url"
                value={url}
                onChange={handleInputChange}
                placeholder="https://29cm.co.kr/products/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              {loading ? '로딩 중...' : '다음'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-2">💡 팁:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>29cm의 상품 상세 페이지 링크를 복사하세요</li>
              <li>예: https://29cm.co.kr/products/블라우스상품번호</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

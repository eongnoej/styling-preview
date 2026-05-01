import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductStore } from '@/store/productStore'
import { generateCategoryQuestion } from '@/lib/crawl/apiClient'
import { ClothingCategory } from '@/types/product'

export default function ConfirmCategoryPage() {
  const navigate = useNavigate()
  const { product } = useProductStore()
  const [customCategory, setCustomCategory] = useState<ClothingCategory | ''>('')
  const [showDropdown, setShowDropdown] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">상품 정보를 찾을 수 없습니다</p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            처음으로
          </button>
        </div>
      </div>
    )
  }

  const categoryQuestion = generateCategoryQuestion(product.category)

  const handleConfirm = () => {
    navigate('/body')
  }

  const handleCustomCategory = (category: ClothingCategory) => {
    setCustomCategory(category)
    setShowDropdown(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* 단계 표시기 */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2
                  ? 'bg-white text-purple-600'
                  : step < 2
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            상품 확인
          </h1>

          {/* 상품 정보 */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            {product.mainImage && (
              <img
                src={product.mainImage}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-3"
                onError={(e) => {
                  e.currentTarget.src =
                    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E'
                }}
              />
            )}
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-lg font-bold text-purple-600 mb-2">
              {typeof product.price === 'number' ? `${product.price.toLocaleString()}원` : product.price}
            </p>
            <p className="text-sm text-gray-600">
              카테고리: <span className="font-semibold">{product.category.secondary}</span>
            </p>
          </div>

          {/* 카테고리 확인 */}
          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-900 mb-4">
              {categoryQuestion}
            </p>

            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                맞아요 ✓
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-4 rounded-lg transition text-left flex items-center justify-between"
                >
                  <span>
                    {customCategory ? `${customCategory}로 변경` : '아니요, 수정할게요'}
                  </span>
                  <span>{showDropdown ? '▼' : '▶'}</span>
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {(['top', 'bottom', 'outer'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCustomCategory(cat)}
                        className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition ${
                          customCategory === cat ? 'bg-purple-100 font-semibold' : ''
                        }`}
                      >
                        {cat === 'top'
                          ? '상의'
                          : cat === 'bottom'
                            ? '하의'
                            : '아우터'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="w-full text-gray-600 hover:text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
          >
            ← 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}

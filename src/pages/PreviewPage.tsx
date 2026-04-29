import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useProductStore } from '@/store/productStore'
import { useBodyInfoStore } from '@/store/bodyInfoStore'
import { useIndexedDB } from '@/hooks/useIndexedDB'
import PreviewCanvas from '@/components/preview/PreviewCanvas'

export default function PreviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { product } = useProductStore()
  const { bodyInfo } = useBodyInfoStore()
  const { save: saveToIndexedDB } = useIndexedDB()

  const [isCapturing, setIsCapturing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  if (!product || !bodyInfo) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">필수 정보가 없습니다</p>
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

  const sourceImageUrl = (location.state as any)?.sourceImageUrl

  const handleCapture = async () => {
    if (!canvasRef.current || !product || !bodyInfo) return

    setIsCapturing(true)
    setSaveError(null)

    try {
      // Canvas를 PNG 이미지로 변환
      const imageUrl = canvasRef.current.toDataURL('image/png')

      // IndexedDB에 저장
      await saveToIndexedDB({
        productUrl: product.url,
        productName: product.name,
        productPrice: product.price,
        category: product.category.secondary,
        resultImageUrl: imageUrl,
        bodyInfo: {
          gender: bodyInfo.gender,
          bodyType: bodyInfo.bodyType,
          height: bodyInfo.height,
        },
        savedAt: Date.now(),
      })

      setIsCapturing(false)
      navigate('/saved')
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : '저장 실패'
      setSaveError(errorMsg)
      setIsCapturing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 단계 표시기 */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 5
                  ? 'bg-purple-600 text-white'
                  : step < 5
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        {/* 제목 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            스타일링 미리보기
          </h1>
          <p className="text-gray-600">
            {product.name} - {product.category.secondary}
          </p>
        </div>

        {/* 미리보기 캔버스 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <PreviewCanvas
            clothingImageUrl={product.mainImage}
            clothingCategory={product.category.primary}
            bodyInfo={bodyInfo}
            sourceImageUrl={sourceImageUrl}
            onCaptureReady={(canvas) => {
              canvasRef.current = canvas
            }}
            showDebug={false}
          />
        </div>

        {/* 에러 메시지 */}
        {saveError && (
          <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg p-4 mb-6">
            ❌ {saveError}
          </div>
        )}

        {/* 컨트롤 버튼 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4">
            <button
              onClick={handleCapture}
              disabled={isCapturing || !canvasRef.current}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              {isCapturing ? '저장 중...' : '💾 저장'}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 px-4 rounded-lg transition"
            >
              ← 다시 선택
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-3 text-gray-600 hover:text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
          >
            처음으로 돌아가기
          </button>
        </div>

        {/* 정보 박스 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 팁:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>AI가 실시간으로 신체를 감지하여 의류를 표시합니다</li>
            <li>처음 로딩은 약 3-5초 걸릴 수 있습니다</li>
            <li>충분한 조명이 있는 곳에서 사용하세요</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

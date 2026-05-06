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
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
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

  const getCanvasImageForAI = (): string => {
    const canvas = canvasRef.current
    if (!canvas) {
      throw new Error('미리보기 이미지를 찾을 수 없습니다')
    }

    const maxDimension = 1536
    const scale = Math.min(1, maxDimension / Math.max(canvas.width, canvas.height))

    if (scale === 1) {
      return canvas.toDataURL('image/jpeg', 0.92)
    }

    const resizedCanvas = document.createElement('canvas')
    resizedCanvas.width = Math.round(canvas.width * scale)
    resizedCanvas.height = Math.round(canvas.height * scale)

    const ctx = resizedCanvas.getContext('2d')
    if (!ctx) {
      throw new Error('이미지를 처리할 수 없습니다')
    }

    ctx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height)
    return resizedCanvas.toDataURL('image/jpeg', 0.92)
  }

  const handleGenerateAI = async () => {
    if (!canvasRef.current || !product || !bodyInfo) return

    setIsGeneratingAI(true)
    setAiError(null)

    try {
      const personImage = getCanvasImageForAI()
      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personImage,
          garmentImageUrl: product.mainImage,
          productName: product.name,
          category: product.category.secondary,
          bodyInfo,
        }),
      })
      const result = await response.json()

      if (!response.ok || !result.success || !result.imageUrl) {
        throw new Error(result.error || 'AI 합성에 실패했습니다')
      }

      setAiImageUrl(result.imageUrl)
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'AI 합성에 실패했습니다'
      setAiError(errorMsg)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleCapture = async () => {
    if (!canvasRef.current || !product || !bodyInfo) return

    setIsCapturing(true)
    setSaveError(null)

    try {
      // Canvas를 PNG 이미지로 변환
      const imageUrl = aiImageUrl || canvasRef.current.toDataURL('image/png')

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
          weight: bodyInfo.weight,
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

        {aiImageUrl && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              AI 합성 결과
            </h2>
            <img
              src={aiImageUrl}
              alt="AI 합성 스타일링 결과"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        {aiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg p-4 mb-6">
            {aiError}
          </div>
        )}

        {/* 에러 메시지 */}
        {saveError && (
          <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg p-4 mb-6">
            ❌ {saveError}
          </div>
        )}

        {/* 컨트롤 버튼 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <button
            onClick={handleGenerateAI}
            disabled={isGeneratingAI || !canvasRef.current}
            className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition mb-4"
          >
            {isGeneratingAI ? 'AI 합성 중...' : 'AI 합성 생성'}
          </button>

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

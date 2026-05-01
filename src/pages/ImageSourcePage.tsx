import { useNavigate } from 'react-router-dom'
import { useProductStore } from '@/store/productStore'

export default function ImageSourcePage() {
  const navigate = useNavigate()
  const { product } = useProductStore()

  const handleCameraSelect = () => {
    // 갤러리 이미지 없이 카메라로 진행
    navigate('/preview', { state: { sourceImageUrl: null } })
  }

  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일을 Data URL로 변환
    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      navigate('/preview', { state: { sourceImageUrl: url } })
    }
    reader.readAsDataURL(file)
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 4
                  ? 'bg-white text-purple-600'
                  : step < 4
                    ? 'bg-white text-purple-600'
                    : 'bg-white bg-opacity-30 text-white'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            이미지 소스 선택
          </h1>

          <div className="space-y-4">
            <button
              onClick={handleCameraSelect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <span>📷</span>
              <span>카메라로 촬영</span>
            </button>

            <label className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleGallerySelect}
                className="hidden"
              />
              <span>🖼️</span>
              <span>갤러리에서 선택</span>
            </label>
          </div>

          <p className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-2">💡 팁:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>카메라: 실시간으로 스타일링을 미리볼 수 있습니다</li>
              <li>갤러리: 기존 사진에 의류를 입혀볼 수 있습니다</li>
            </ul>
          </p>

          <button
            onClick={() => navigate(-1)}
            className="w-full text-gray-600 hover:text-gray-900 font-semibold py-2 px-4 rounded-lg transition mt-4"
          >
            ← 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}

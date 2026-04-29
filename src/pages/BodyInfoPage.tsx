import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBodyInfoStore } from '@/store/bodyInfoStore'
import { BodyType, Gender } from '@/types/bodyInfo'

export default function BodyInfoPage() {
  const navigate = useNavigate()
  const { setBodyInfo } = useBodyInfoStore()

  const [gender, setGender] = useState<Gender>('female')
  const [bodyType, setBodyType] = useState<BodyType>('normal')
  const [height, setHeight] = useState('')
  const [bust, setBust] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!height) {
      setError('키를 입력해주세요')
      return
    }

    const heightNum = parseFloat(height)
    if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      setError('키는 100cm 이상 250cm 이하로 입력해주세요')
      return
    }

    setBodyInfo({
      gender,
      bodyType,
      height: heightNum,
      bust: bust ? parseFloat(bust) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hip: hip ? parseFloat(hip) : undefined,
      createdAt: Date.now(),
    })

    navigate('/image-source')
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
                step === 3
                  ? 'bg-white text-purple-600'
                  : step < 3
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">신체 정보 입력</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 성별 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                성별 *
              </label>
              <div className="flex gap-4">
                {(['female', 'male', 'other'] as const).map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">
                      {g === 'female' ? '여성' : g === 'male' ? '남성' : '기타'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 체형 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                체형 *
              </label>
              <div className="space-y-2">
                {(['slim', 'normal', 'plus'] as const).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 transition"
                  >
                    <input
                      type="radio"
                      name="bodyType"
                      value={type}
                      checked={bodyType === type}
                      onChange={(e) => setBodyType(e.target.value as BodyType)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-gray-700">
                      {type === 'slim'
                        ? '마름 💪'
                        : type === 'normal'
                          ? '보통 🎯'
                          : '통통함 ❤️'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 키 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                키 (cm) *
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="예: 165"
                min="100"
                max="250"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* 선택 사항: 사이즈 */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                사이즈 (선택사항)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={bust}
                  onChange={(e) => setBust(e.target.value)}
                  placeholder="가슴"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <input
                  type="number"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="허리"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <input
                  type="number"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  placeholder="엉덩이"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              다음
            </button>
          </form>

          <button
            onClick={() => navigate(-1)}
            className="w-full text-gray-600 hover:text-gray-900 font-semibold py-2 px-4 rounded-lg transition mt-3"
          >
            ← 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}

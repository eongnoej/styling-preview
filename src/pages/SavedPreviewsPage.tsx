import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIndexedDB } from '@/hooks/useIndexedDB'

export default function SavedPreviewsPage() {
  const navigate = useNavigate()
  const { previews, loading, error, remove, refresh, storageStatus } = useIndexedDB()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await remove(id)
      setDeleteConfirmId(null)
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = (preview: any) => {
    // Base64를 Blob으로 변환
    const arr = preview.resultImageUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    const n = bstr.length
    const u8arr = new Uint8Array(n)
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i)
    }
    const blob = new Blob([u8arr], { type: mime })

    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `styling-${preview.id}-${new Date(preview.savedAt).toISOString().split('T')[0]}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 단계 표시기 */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 6
                  ? 'bg-purple-600 text-white'
                  : step < 6
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            저장된 미리보기
          </h1>

          {/* 저장소 상태 */}
          {storageStatus && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <p>
                💾 저장됨: <strong>{storageStatus.count}개</strong> | 용량:{' '}
                <strong>{storageStatus.sizeInMB.toFixed(2)}MB</strong>
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* 미리보기 그리드 */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : previews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 mb-4 text-lg">
              저장된 미리보기가 없습니다
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              새로운 스타일링 시작
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {previews.map((preview) => (
                <div
                  key={preview.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  {/* 이미지 */}
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={preview.resultImageUrl}
                      alt={preview.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 정보 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                      {preview.productName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(preview.savedAt).toLocaleDateString('ko-KR')}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {preview.category}
                    </p>

                    {/* 버튼 그룹 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(preview)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 px-2 rounded transition"
                      >
                        ⬇️ 다운로드
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(preview.id.toString())}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 px-2 rounded transition"
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 액션 버튼 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              ➕ 새로운 스타일링
            </button>
            <button
              onClick={refresh}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              🔄 새로고침
            </button>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              정말 삭제하시겠어요?
            </h3>
            <p className="text-gray-600 mb-6">
              이 미리보기는 복구할 수 없습니다.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

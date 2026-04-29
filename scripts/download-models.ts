import https from 'https'
import fs from 'fs'
import path from 'path'

const MODELS_DIR = path.resolve(__dirname, '../public/models/face-api')

// face-api.js 모델 파일들
const FACE_API_MODELS = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
]

const BASE_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'

function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath)

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${response.statusCode}`))
          return
        }

        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
      })
      .on('error', (err) => {
        fs.unlink(outputPath, () => {}) // Delete the file
        reject(err)
      })
  })
}

async function main() {
  // 디렉토리 생성
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true })
  }

  console.log('📥 face-api 모델 다운로드 시작...')

  for (const model of FACE_API_MODELS) {
    const url = `${BASE_URL}${model}`
    const outputPath = path.join(MODELS_DIR, model)

    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  ${model} (이미 존재)`)
      continue
    }

    try {
      console.log(`⏳ ${model} 다운로드 중...`)
      await downloadFile(url, outputPath)
      console.log(`✅ ${model} 다운로드 완료`)
    } catch (error) {
      console.error(`❌ ${model} 다운로드 실패:`, error instanceof Error ? error.message : error)
    }
  }

  console.log('✨ 모델 다운로드 완료!')
}

main().catch((error) => {
  console.error('❌ 에러 발생:', error)
  process.exit(1)
})

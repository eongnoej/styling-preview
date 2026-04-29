import express from 'express'
import cors from 'cors'
import crawlRouter from './routes/crawl'

const app = express()
const PORT = 3001

// 미들웨어
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// 라우트
app.use('/api', crawlRouter)

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 에러 핸들러
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    error: '서버 오류가 발생했습니다',
  })
})

app.listen(PORT, () => {
  console.log(`✅ Express 서버 시작: http://localhost:${PORT}`)
  console.log(`📡 크롤링 엔드포인트: POST /api/crawl`)
})

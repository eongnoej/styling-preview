import { Router, Request, Response } from 'express'
import axios from 'axios'
import { parse29cmProduct } from '../parsers/twentyninecm'

const router = Router()

router.post('/crawl', async (req: Request, res: Response) => {
  try {
    const { url } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'URL이 필요합니다' })
    }

    // URL 검증
    if (!url.includes('29cm.co.kr')) {
      return res.status(400).json({ success: false, error: '29cm 링크만 지원됩니다' })
    }

    // 29cm 페이지 크롤링
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Referer': 'https://29cm.co.kr/',
      },
      timeout: 10000,
    })

    // HTML 파싱
    const product = await parse29cmProduct(response.data, url)

    res.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Crawl error:', error)

    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        success: false,
        error: '29cm 페이지를 불러올 수 없습니다',
      })
    }

    res.status(500).json({
      success: false,
      error: '크롤링 중 오류가 발생했습니다',
    })
  }
})

export default router

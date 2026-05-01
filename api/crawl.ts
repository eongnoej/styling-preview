import axios from 'axios'
import { parse29cmProduct } from '../server/parsers/twentyninecm'

const is29cmProductUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false

  try {
    const url = new URL(value)
    return (
      url.hostname === '29cm.co.kr' ||
      url.hostname === 'www.29cm.co.kr'
    ) && url.pathname.startsWith('/products/')
  } catch {
    return false
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({
      success: false,
      error: 'POST 요청만 지원됩니다',
    })
  }

  const { url } = req.body || {}

  if (!is29cmProductUrl(url)) {
    return res.status(400).json({
      success: false,
      error: '29cm 상품 상세 페이지 링크를 입력해주세요',
    })
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        Referer: 'https://29cm.co.kr/',
      },
      timeout: 10000,
    })

    const product = await parse29cmProduct(response.data, url)

    return res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Crawl error:', error)

    return res.status(502).json({
      success: false,
      error: '29cm 상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    })
  }
}

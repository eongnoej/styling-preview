import axios from 'axios'

type ClothingCategory = 'top' | 'bottom' | 'outer'

interface ParsedProduct {
  url: string
  name: string
  price: number | string
  mainImage: string
  galleryImages: string[]
  category: {
    primary: ClothingCategory
    secondary: string
  }
}

const CATEGORY_MAP: Record<string, ClothingCategory> = {
  '상의': 'top',
  '블라우스': 'top',
  '니트': 'top',
  '티셔츠': 'top',
  '셔츠': 'top',
  '가디건': 'top',
  '하의': 'bottom',
  '청바지': 'bottom',
  '팬츠': 'bottom',
  '스커트': 'bottom',
  '쇼츠': 'bottom',
  '아우터': 'outer',
  '코트': 'outer',
  '재킷': 'outer',
  '패딩': 'outer',
  '점퍼': 'outer',
  '블레이저': 'outer',
}

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

const decodeHtml = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const getMetaContent = (html: string, property: string): string => {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeHtml(match[1].trim())
  }

  return ''
}

const mapToPrimary = (secondary: string): ClothingCategory => {
  const key = Object.keys(CATEGORY_MAP).find((category) => secondary.includes(category))
  return key ? CATEGORY_MAP[key] : 'top'
}

const extractCategory = (html: string): { primary: ClothingCategory; secondary: string } => {
  const candidates = Object.keys(CATEGORY_MAP).filter((category) => html.includes(category))
  const secondary = candidates[0] || '상의'

  return {
    primary: mapToPrimary(secondary),
    secondary,
  }
}

const parseProduct = (html: string, url: string): ParsedProduct => {
  const title =
    getMetaContent(html, 'og:title') ||
    getMetaContent(html, 'twitter:title') ||
    '29cm 상품'
  const image =
    getMetaContent(html, 'og:image') ||
    getMetaContent(html, 'twitter:image')
  const priceText =
    getMetaContent(html, 'product:price:amount') ||
    html.match(/"price"\s*:\s*"?([\d,]+)"?/)?.[1] ||
    ''
  const price = priceText ? Number(priceText.replace(/,/g, '')) || priceText : 'N/A'
  const category = extractCategory(html)

  return {
    url,
    name: title.replace(/\s*\|\s*29CM\s*$/i, '').trim(),
    price,
    mainImage: image,
    galleryImages: image ? [image] : [],
    category,
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
      maxRedirects: 5,
    })

    const product = parseProduct(String(response.data), url)

    return res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    console.error('Crawl error:', {
      message: error instanceof Error ? error.message : String(error),
      status,
    })

    return res.status(502).json({
      success: false,
      error: status
        ? `29cm 상품 정보를 불러오지 못했습니다. 29cm 응답 코드: ${status}`
        : '29cm 상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    })
  }
}

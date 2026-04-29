import * as cheerio from 'cheerio'
import type { ClothingCategory } from '../../src/types/product'

const CATEGORY_MAP: Record<string, ClothingCategory> = {
  '상의': 'top',
  '블라우스': 'top',
  '니트': 'top',
  '티셔츠': 'top',
  '셔츠': 'top',
  '카라': 'top',
  '후드': 'top',
  '크롭': 'top',
  '폴로': 'top',
  '스웨터': 'top',
  '가디건': 'top',
  '조끼': 'top',

  '하의': 'bottom',
  '청바지': 'bottom',
  '팬츠': 'bottom',
  '스커트': 'bottom',
  '래깅스': 'bottom',
  '핸드팬츠': 'bottom',
  '쇼츠': 'bottom',
  '치노팬츠': 'bottom',
  '코듀로이': 'bottom',

  '아우터': 'outer',
  '코트': 'outer',
  '재킷': 'outer',
  '패딩': 'outer',
  '점퍼': 'outer',
  '블레이저': 'outer',
  '가죽자켓': 'outer',
  '뽀글이': 'outer',
  '남방': 'outer',
}

function mapToPrimary(secondaryCategory: string): ClothingCategory {
  return CATEGORY_MAP[secondaryCategory] || 'top'
}

export interface ParsedProduct {
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

export async function parse29cmProduct(html: string, url: string): Promise<ParsedProduct> {
  const $ = cheerio.load(html)

  // 1. 상품명
  const name =
    $('meta[property="og:title"]').attr('content') ||
    $('h1').text().trim() ||
    'Unknown Product'

  // 2. 가격
  let price: number | string = 'N/A'
  try {
    const priceText = $('.price').first().text() || $('.product-price').first().text()
    const priceMatch = priceText.match(/[\d,]+/)
    if (priceMatch) {
      price = parseInt(priceMatch[0].replace(/,/g, ''))
    }
  } catch (e) {
    // 가격 파싱 실패 시 기본값 사용
  }

  // 3. 상품 이미지
  const mainImage =
    $('meta[property="og:image"]').attr('content') ||
    $('img.product-image').first().attr('src') ||
    $('img[src*="img.29cm"]').first().attr('src') ||
    ''

  // 4. 갤러리 이미지 (선택적)
  const galleryImages = $('img.product-image, img[data-src*="img.29cm"]')
    .map((_, el) => $(el).attr('src') || $(el).attr('data-src') || '')
    .get()
    .filter((src) => src && typeof src === 'string' && src.length > 0)

  // 5. 카테고리 추출 (두 가지 방식 시도)
  let primaryCategory: ClothingCategory = 'top'
  let secondaryCategory = '상의'

  // 방식 1: 브레드크럼
  try {
    const breadcrumbs = $('nav.breadcrumb a, .breadcrumb li')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((text) => text && text.length > 0)

    if (breadcrumbs.length >= 2) {
      // 마지막 2개 항목이 카테고리
      const categoryParts = breadcrumbs.slice(-2)
      secondaryCategory = categoryParts[categoryParts.length - 1]
      primaryCategory = mapToPrimary(secondaryCategory)
    }
  } catch (e) {
    // 브레드크럼 파싱 실패 시 다음 방식 시도
  }

  // 방식 2: Next.js __NEXT_DATA__ JSON
  try {
    const nextDataScript = $('#__NEXT_DATA__').text()
    if (nextDataScript) {
      const nextData = JSON.parse(nextDataScript)
      const categoryPath =
        nextData?.props?.pageProps?.productDetail?.categoryPath ||
        nextData?.props?.pageProps?.category

      if (categoryPath && Array.isArray(categoryPath)) {
        secondaryCategory = categoryPath[categoryPath.length - 1]
        primaryCategory = mapToPrimary(secondaryCategory)
      }
    }
  } catch (e) {
    // JSON 파싱 실패, 기본값 사용
  }

  return {
    url,
    name,
    price,
    mainImage,
    galleryImages: galleryImages.slice(0, 10), // 최대 10개
    category: {
      primary: primaryCategory,
      secondary: secondaryCategory,
    },
  }
}

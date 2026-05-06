type BodyPayload = {
  gender?: string
  bodyType?: string
  height?: number
  weight?: number
  bust?: number
  waist?: number
  hip?: number
}

type TryOnRequest = {
  personImage?: string
  garmentImageUrl?: string
  productName?: string
  category?: string
  bodyInfo?: BodyPayload
}

const dataUrlToBlob = (dataUrl: string): Blob => {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/)
  if (!match) {
    throw new Error('올바른 이미지 데이터가 아닙니다')
  }

  const mimeType = match[1]
  const binary = Buffer.from(match[2], 'base64')
  return new Blob([new Uint8Array(binary)], { type: mimeType })
}

const getGarmentImage = async (url: string): Promise<Blob> => {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`의류 이미지를 불러오지 못했습니다: ${response.status}`)
  }

  return await response.blob()
}

const getBodyPrompt = (bodyInfo?: BodyPayload): string => {
  if (!bodyInfo) return ''

  const details = [
    bodyInfo.gender ? `gender: ${bodyInfo.gender}` : '',
    bodyInfo.bodyType ? `body type: ${bodyInfo.bodyType}` : '',
    bodyInfo.height ? `height: ${bodyInfo.height}cm` : '',
    bodyInfo.weight ? `weight: ${bodyInfo.weight}kg` : '',
    bodyInfo.bust ? `bust: ${bodyInfo.bust}cm` : '',
    bodyInfo.waist ? `waist: ${bodyInfo.waist}cm` : '',
    bodyInfo.hip ? `hip: ${bodyInfo.hip}cm` : '',
  ].filter(Boolean)

  return details.length ? ` Body measurements to respect: ${details.join(', ')}.` : ''
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({
      success: false,
      error: 'POST 요청만 지원됩니다',
    })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'OPENAI_API_KEY 환경변수가 필요합니다',
    })
  }

  const {
    personImage,
    garmentImageUrl,
    productName,
    category,
    bodyInfo,
  } = (req.body || {}) as TryOnRequest

  if (!personImage || !garmentImageUrl) {
    return res.status(400).json({
      success: false,
      error: '사람 이미지와 의류 이미지가 필요합니다',
    })
  }

  try {
    const personBlob = dataUrlToBlob(personImage)
    const garmentBlob = await getGarmentImage(garmentImageUrl)
    const prompt = [
      'Create a realistic virtual try-on image.',
      'Use the first image as the person and preserve their face, pose, body shape, camera angle, lighting, and background.',
      'Use the second image as the garment reference. Remove the garment background if present and dress the person in that garment.',
      'Make the clothing fit naturally with realistic folds, occlusion, shadows, and fabric texture.',
      'Do not change identity, hairstyle, facial features, skin tone, or the overall scene.',
      productName ? `Garment/product name: ${productName}.` : '',
      category ? `Garment category: ${category}.` : '',
      getBodyPrompt(bodyInfo),
    ].filter(Boolean).join(' ')

    const form = new FormData()
    form.append('model', process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1')
    form.append('prompt', prompt)
    form.append('image', personBlob, 'person.png')
    form.append('image', garmentBlob, 'garment.png')
    form.append('size', '1024x1536')
    form.append('quality', 'medium')
    form.append('output_format', 'png')

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    })

    const result = await response.json()

    if (!response.ok) {
      const message =
        result?.error?.message ||
        result?.message ||
        `OpenAI 이미지 합성 실패: ${response.status}`
      return res.status(response.status).json({
        success: false,
        error: message,
      })
    }

    const base64Image = result?.data?.[0]?.b64_json
    if (!base64Image) {
      return res.status(502).json({
        success: false,
        error: 'OpenAI 응답에서 이미지 데이터를 찾지 못했습니다',
      })
    }

    return res.status(200).json({
      success: true,
      imageUrl: `data:image/png;base64,${base64Image}`,
    })
  } catch (error) {
    console.error('Try-on error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'AI 합성 중 오류가 발생했습니다',
    })
  }
}

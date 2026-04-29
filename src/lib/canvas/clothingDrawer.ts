import { BodyRegion, BodyRegion as BodyRegionType } from '@/types/pose'
import { BodyInfo } from '@/types/bodyInfo'
import { ClothingCategory } from '@/types/product'

/**
 * 체형에 따른 의류 폭 조정 계수
 * 마름: 0.85, 보통: 1.00, 통통함: 1.15
 */
function getWidthScale(bodyType: BodyInfo['bodyType']): number {
  const scales: Record<BodyInfo['bodyType'], number> = {
    slim: 0.85,
    normal: 1.0,
    plus: 1.15,
  }
  return scales[bodyType]
}

/**
 * 키에 따른 의류 기장 조정 계수
 * 기준: 170cm
 */
function getHeightScale(height: number): number {
  const baseHeight = 170
  return height / baseHeight
}

export interface ClothingDrawParams {
  ctx: CanvasRenderingContext2D
  clothingImage: HTMLImageElement
  bodyRegion: BodyRegionType
  bodyInfo: BodyInfo
  category: ClothingCategory
}

/**
 * Canvas에 의류 이미지를 신체 위에 그림
 * affine transform (translate, rotate, scale)을 사용하여 변형
 */
export function drawClothingOverlay({
  ctx,
  clothingImage,
  bodyRegion,
  bodyInfo,
  category,
}: ClothingDrawParams): void {
  // 스케일 계산
  const widthScale = getWidthScale(bodyInfo.bodyType)
  const heightScale = getHeightScale(bodyInfo.height)

  // 그릴 신체 영역 선택
  const region = bodyRegion[category === 'outer' ? 'top' : category]

  if (!region || region.width === 0 || region.height === 0) {
    return // 유효한 영역이 없으면 생략
  }

  ctx.save()

  // 회전 중심점을 신체 영역 중앙으로 설정
  const centerX = region.x + region.width / 2
  const centerY = region.y + region.height / 2

  // 변환 적용
  ctx.translate(centerX, centerY)
  ctx.rotate(region.shoulderAngle || 0)
  ctx.scale(widthScale, heightScale)

  // 의류 이미지 그리기
  const drawX = -region.width / 2
  const drawY = -region.height / 2

  ctx.globalAlpha = 0.95 // 약간 투명하게 (배경과 섞이게)
  ctx.drawImage(clothingImage, drawX, drawY, region.width, region.height)
  ctx.globalAlpha = 1.0

  ctx.restore()
}

/**
 * 디버그: 신체 영역을 시각화 (개발용)
 */
export function debugDrawBodyRegion(
  ctx: CanvasRenderingContext2D,
  bodyRegion: BodyRegionType
): void {
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'
  ctx.lineWidth = 2

  // 상의 영역
  ctx.strokeRect(
    bodyRegion.top.x,
    bodyRegion.top.y,
    bodyRegion.top.width,
    bodyRegion.top.height
  )

  // 하의 영역
  ctx.strokeRect(
    bodyRegion.bottom.x,
    bodyRegion.bottom.y,
    bodyRegion.bottom.width,
    bodyRegion.bottom.height
  )

  // 라벨
  ctx.fillStyle = 'rgba(0, 255, 0, 1)'
  ctx.font = '12px Arial'
  ctx.fillText('상의', bodyRegion.top.x + 5, bodyRegion.top.y + 15)
  ctx.fillText('하의', bodyRegion.bottom.x + 5, bodyRegion.bottom.y + 15)
}

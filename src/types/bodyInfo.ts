export type Gender = 'male' | 'female' | 'other'
export type BodyType = 'slim' | 'normal' | 'plus'

export interface BodyInfo {
  gender: Gender
  bodyType: BodyType
  height: number // cm
  bust?: number // cm (선택)
  waist?: number // cm (선택)
  hip?: number // cm (선택)
  createdAt?: number
}

export interface BodyMeasurements {
  bust?: number
  waist?: number
  hip?: number
}

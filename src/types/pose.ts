export interface Keypoint {
  name: string
  x: number
  y: number
  z?: number
  score: number
}

export interface BodyRegion {
  top: {
    x: number
    y: number
    width: number
    height: number
    shoulderAngle: number
  }
  bottom: {
    x: number
    y: number
    width: number
    height: number
  }
  outer?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface FaceDetectionResult {
  box: {
    x: number
    y: number
    width: number
    height: number
  }
  landmarks: Array<{ x: number; y: number }>
  score: number
}

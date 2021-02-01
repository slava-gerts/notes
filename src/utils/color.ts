const WHITE_COLOR = '#fff'
const BLACK_COLOR = '#000'

interface RGB {
  r: number
  g: number
  b: number
}

export const getRandomColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

const hexToRgb = (colorHex: string): RGB | undefined => {
  if (!colorHex) return undefined

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorHex)

  if (!result || result.length !== 4) return undefined

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  }
}

const rgbToYIQ = ({r, g, b}: RGB): number => {
  return ((r * 299) + (g * 587) + (b * 114)) / 1000
}

// calculates color that is contrast of given in the parameter
export const getContrastColor = (colorHex: string, threshold = 128): string => {
  if (!colorHex) return BLACK_COLOR

  const rgb = hexToRgb(colorHex)

  if (!rgb) return BLACK_COLOR

  return rgbToYIQ(rgb) >= threshold ? BLACK_COLOR : WHITE_COLOR
}
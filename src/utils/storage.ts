const STORAGE_KEY = 'notes'

export interface StyleData {
  backgroundColor: string
  color: string
  left: string
  top: string
  width: string
  height: string
}

export interface SavedNoteData {
  style: StyleData
  value: string
}

const transformStyle = (style: any): StyleData => {
  return {
    backgroundColor: style?.backgroundColor,
    color: style?.color,
    left: style?.left,
    top: style?.top,
    width: style?.width,
    height: style?.height
  }
}

export const getSavedData = () => {
  const savedData = localStorage.getItem(STORAGE_KEY) || '{}'
  return JSON.parse(savedData)
}

export const saveToStorage = (noteData: SavedNoteData, index: number) => {
  noteData.style = transformStyle(noteData.style)
  const savedData = getSavedData()
  savedData[index] = noteData
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData))
}

export const deleteFromStorage = (index: number) => {
  const savedData = getSavedData()
  delete savedData[index]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData))
}

export const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY)
}
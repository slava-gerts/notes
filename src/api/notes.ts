import {getSavedData} from '../utils/storage'

let mockData = {}
const successResponse = {ok: true, status: 200}

const wait = (data: any, delay: number) => new Promise(resolve => setTimeout(() => resolve(data), delay))

export const fetchNotes = () => {
  return wait(mockData, 1000)
}

export const saveNotes = () => {
  mockData = getSavedData()
  return wait(successResponse, 1000)
}
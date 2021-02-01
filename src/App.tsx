import React from 'react'
import classNames from 'classnames'
// we are using import like 'lodash/forEach' in order to support tree shaking
import forEach from 'lodash/forEach'

import {fetchNotes, saveNotes} from './api/notes'
import {Bin, Loader, Note} from './components'
import {getRandomColor, getContrastColor} from './utils/color'
import {clearStorage, deleteFromStorage, getSavedData, SavedNoteData} from './utils/storage'

import './App.css';

interface NoteData {
  active: boolean
  index: number
  note: React.ReactElement
}

function App() {
  const [noteDataList, setNoteDataList] = React.useState<NoteData[]>([])
  const [loading, setLoading] = React.useState(false)

  const noteIndex = React.useRef<number>(0)

  const onRemoveNoteHandler = React.useCallback((index: number) => {
    setNoteDataList(noteDataList => noteDataList.filter(noteData => noteData.index !== index))
    deleteFromStorage(index)
  }, [setNoteDataList])

  const onMouseDown = React.useCallback((index: number) => {
    // set element with required index as active in order to display it above all elements
    setNoteDataList(noteDataList => noteDataList.map(noteData => ({...noteData, active: noteData.index === index})))
  }, [setNoteDataList])

  const renderNotesFromData = React.useCallback(savedData => {
    clearStorage()

    const noteDataList: NoteData[] = []
    forEach(savedData, (data: SavedNoteData) => {
      const index = ++noteIndex.current
      const note = React.createElement(
        Note,
        {savedNoteData: data, index, onRemoveHandler: onRemoveNoteHandler, onMouseDown}
      )
      const noteData: NoteData = {active: false, index, note}
      noteDataList.push(noteData)
    })
    setNoteDataList(noteDataList)
  }, [onMouseDown, onRemoveNoteHandler])

  const loadNotesFromStorage = React.useCallback(() => {
    const savedData = getSavedData()
    renderNotesFromData(savedData)
  }, [renderNotesFromData])

  React.useEffect(() => {
    loadNotesFromStorage()
  }, [loadNotesFromStorage])

  const addNoteHandler = React.useCallback(() => {
    const backgroundColor = getRandomColor()
    const color = getContrastColor(backgroundColor)
    const index = ++noteIndex.current
    const note = React.createElement(
      Note,
      {backgroundColor, color, index, onRemoveHandler: onRemoveNoteHandler, onMouseDown}
    )
    const noteData: NoteData = {active: false, index, note}
    setNoteDataList(noteDataList => [...noteDataList, noteData])
  }, [onMouseDown, onRemoveNoteHandler, setNoteDataList])

  const onSaveToServer = React.useCallback(() => {
    setLoading(true)
    saveNotes().finally(() => setLoading(false))
  }, [])

  const onLoadFromServer = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchNotes()
      renderNotesFromData(data)
    } catch {
      setNoteDataList([])
    } finally {
      setLoading(false)
    }
  }, [renderNotesFromData])

  return (
    <div className="App">
      <header className="header">
        <div className="buttonWrapper">
          <button className="button" onClick={addNoteHandler}>Add note</button>
          <button className="button" onClick={onSaveToServer}>Save to the sever</button>
          <button className="button" onClick={onLoadFromServer}>Load from the server</button>
        </div>
        {loading && <Loader />}
      </header>
      <Bin />
      {noteDataList.map(
        ({note, index, active}) =>
          <div className={classNames('noteWrapper', {'active': active})} key={index}>{note}</div>
      )}
    </div>
  );
}

export default App;

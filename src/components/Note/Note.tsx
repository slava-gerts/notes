import React from 'react'
// we are using import like 'lodash/debounce' in order to support tree shaking
import debounce from 'lodash/debounce'
import forEach from 'lodash/forEach'

import {BIN_CLASS} from '../../constants'
import {saveToStorage, SavedNoteData} from '../../utils/storage'

import './Note.css'

interface NoteProps {
  backgroundColor?: string
  color?: string
  savedNoteData?: SavedNoteData
  index: number
  onRemoveHandler: (index: number) => void
  onMouseDown: (index: number) => void
}

type TextAreaMouseEvent = React.MouseEvent<HTMLTextAreaElement, MouseEvent>

const RESIZING_CORNER_SIZE = 18;

const Note: React.FC<NoteProps> = ({
  backgroundColor,
  color,
  savedNoteData,
  index,
  onRemoveHandler,
  onMouseDown
}) => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null)
  const shiftX = React.useRef(0)
  const shiftY = React.useRef(0)

  const saveDataToStorage = React.useCallback(() => {
    if (!textAreaRef.current) return

    const {value} = textAreaRef.current
    const style = getComputedStyle(textAreaRef.current)
    saveToStorage({style, value}, index)
  }, [index])

  // we are using debounce here to wait when user finishes to type
  const saveDataDebounced = React.useMemo(() => debounce(saveDataToStorage, 250), [saveDataToStorage])

  const onKeyUp = React.useCallback(() => {
    saveDataDebounced()
  }, [saveDataDebounced])

  React.useEffect(() => {
    if (!textAreaRef.current || !savedNoteData) return

    forEach(savedNoteData.style, (value, key) => {
      // @ts-ignore-next-line
      textAreaRef.current.style[key] = value
    })

    textAreaRef.current.value = savedNoteData.value

    saveDataToStorage()
  }, [saveDataToStorage, savedNoteData])

  const onMouseMoveHandler = React.useCallback(event => {
    const element = event.target as HTMLTextAreaElement

    // main code to move a note
    element.style.left = `${event.pageX - shiftX.current}px`
    element.style.top = `${event.pageY - shiftY.current}px`

    if (!onRemoveHandler) return

    // we need to hide our primary element for a bit to check what is below
    element.hidden = true
    const elementBelow = document.elementFromPoint(event.clientX, event.clientY)
    element.hidden = false

    if (!elementBelow) return

    // we want to remove our note if element below is a bin
    if (elementBelow.closest(`.${BIN_CLASS}`)) {
      onRemoveHandler(index)
    }
  }, [index, onRemoveHandler, shiftX, shiftY])

  const onMouseUpHandler = React.useCallback((event: TextAreaMouseEvent) => {
    const element = event.target as HTMLTextAreaElement

    element.removeEventListener('mousemove', onMouseMoveHandler)
    element.style.cursor = 'auto'
    saveDataToStorage()
  }, [onMouseMoveHandler, saveDataToStorage])

  const onMouseDownHandler = React.useCallback((event: TextAreaMouseEvent) => {
    if (onMouseDown) {
      // this method makes our element active and allows us to display it above all elements
      onMouseDown(index)
    }

    const element = event.target as HTMLTextAreaElement

    // calculates mouse shiftX and shiftY to move our note without leaping
    shiftX.current = event.clientX - element.getBoundingClientRect().left
    shiftY.current = event.clientY - element.getBoundingClientRect().top
    const width = element.getBoundingClientRect().width
    const height = element.getBoundingClientRect().height

    // we don't want to move note when user is trying to resize (lower right corner)
    if (shiftX.current < width - RESIZING_CORNER_SIZE || shiftY.current < height - RESIZING_CORNER_SIZE) {
      element.style.cursor = 'move'
      element.addEventListener('mousemove', onMouseMoveHandler)
    }
  }, [index, onMouseDown, onMouseMoveHandler])

  return (
    <textarea
      className="note"
      onMouseDown={onMouseDownHandler}
      onMouseUp={onMouseUpHandler}
      onKeyUp={onKeyUp}
      ref={textAreaRef}
      style={{backgroundColor, color}}
    />
  )
}

export default Note
import { useCallback, useEffect } from 'react'

interface useOutsideClickProps {
  node: any // reference to top level node / element in the collapsible component.
  isOpen: boolean
  onOutsideClick: (data?: any) => void
  onInsideClick?: (data?: any) => void
}

const noop = () => null

const useOutsideClick = ({ node, onOutsideClick, onInsideClick, isOpen }: useOutsideClickProps) => {
  onInsideClick = onInsideClick || noop

  const handleClick = useCallback(
    (e: any) => {
      const current: any = !!node && !!node.current ? node.current : null
      if (!current) return

      if (current.contains(e.target)) {
        // inside click
        onInsideClick && onInsideClick()
        return
      }
      // outside click
      onOutsideClick()
    },
    [node, onInsideClick, onOutsideClick],
  )

  const attachDocumentEventListener = useCallback(
    () => document.addEventListener('mousedown', handleClick),
    [handleClick],
  )
  const removeDocumentEventListener = useCallback(
    () => document.removeEventListener('mousedown', handleClick),
    [handleClick],
  )

  useEffect(() => {
    if (isOpen) {
      attachDocumentEventListener()
    } else {
      removeDocumentEventListener()
    }

    return () => {
      removeDocumentEventListener()
    }
  }, [isOpen, attachDocumentEventListener, removeDocumentEventListener])
}

export default useOutsideClick

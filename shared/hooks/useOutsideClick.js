import { useCallback, useEffect } from "react"

const useOutsideClick = ({ node, onOutsideClick, ids = [] }) => {
  const handleClick = useCallback(
    e => {
      const current = !!node && !!node.current ? node.current : null
      if (!current) return

      if (e.target && !current.contains(e.target)) {
        if (!ids?.includes(e.target.id)) {
          onOutsideClick()
        }
        console.log(e.target.id)
      }
    },
    [node, ids, onOutsideClick]
  )

  const attachDocumentEventListener = useCallback(
    () => document.addEventListener("mousedown", handleClick),
    [handleClick]
  )
  const removeDocumentEventListener = useCallback(
    () => document.removeEventListener("mousedown", handleClick),
    [handleClick]
  )

  useEffect(() => {
    attachDocumentEventListener()

    return () => {
      removeDocumentEventListener()
    }
  }, [attachDocumentEventListener, removeDocumentEventListener])
}

export default useOutsideClick

import { useEffect } from 'react'
import printJS from 'print-js'

export default function PrintButton({ children, onClickEvent, blob, className = ''}) {
  const handleClick = () => {
    if (typeof onClickEvent === 'function') {
      onClickEvent()
    }
  }

  useEffect(() => {
    if (blob) {
      printJS({ printable: blob, type: 'pdf', base64: true })
    }
  }, [blob])

  return (
    <button onClick={handleClick} className={className}>{children}</button>
  )
}

import { useEffect, useState } from "react"

export default function Details({ summary, children, startOpen = false, onChange = null, className = '' }){
  const [open, setOpen] = useState(startOpen)

  useEffect(() => {
    if (typeof onChange === "function") {
      onChange(open)
    }
  }, [open])

  return (
    <details className={className} {...(open ? { open: true } : {})}>
      <summary
        onClick={(e) => {
          e.preventDefault()
          setOpen((open) => !open)
        }}
      >
        {typeof summary === "function" ? summary(open) : summary}
      </summary>
      {open && children}
    </details>
  )
}

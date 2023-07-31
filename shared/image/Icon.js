import React from "react"

export const Icon = ({ className, size, onClick, id }) => {
  return (
    <i
      className={className}
      style={{ fontSize: `${size}` }}
      onClick={onClick}
      id={id}
    />
  )
}

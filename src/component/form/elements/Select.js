import React from "react"

export default function Select({ id, name, placeholder, value, onChange, label, longInfo, info, options, defaultValue = '0' }) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      {longInfo ? <div className="long-info">{longInfo}</div> : ''}
      <select name={name} id={id} value={value} onChange={onChange} defaultValue={defaultValue} className="dropdown-select">
        <option value="0" disabled={true}>{placeholder}</option>

        {options.map((option) => <option value={option.value}>{option.label}</option>)}
      </select>
      {info ? <div className="info">{info}</div> : ''}
    </>
  )
}

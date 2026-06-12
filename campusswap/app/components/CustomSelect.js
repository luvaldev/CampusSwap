'use client'
import { useState, useRef, useEffect } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'

export default function CustomSelect({ options, value, onChange, placeholder = "Seleccionar..." }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="custom-select-container" ref={containerRef}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!selectedOption ? 'placeholder' : ''} style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 'var(--space-3)' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <CaretDown size={16} className={`caret ${isOpen ? 'open' : ''}`} style={{ flexShrink: 0 }} />
      </button>

      {isOpen && (
        <div className="custom-select-dropdown">
          {options.length === 0 ? (
            <div className="empty-msg">No hay opciones disponibles</div>
          ) : (
            options.map(opt => (
              <div
                key={opt.value}
                className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
              >
                <span className="truncate" style={{ maxWidth: '90%' }}>{opt.label}</span>
                {value === opt.value && <Check size={16} weight="bold" color="var(--brand)" style={{ flexShrink: 0 }} />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

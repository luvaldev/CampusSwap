'use client'
import { useState, useEffect } from 'react'
import { Sun, Moon } from '@phosphor-icons/react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    setTheme(storedTheme)
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Prevents hydration mismatch
  if (!mounted) return <div style={{ width: 36, height: 36 }} />

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? <Sun size={20} weight="bold" /> : <Moon size={20} weight="bold" />}
      
      <style jsx>{`
        .theme-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-pill);
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
        }
        .theme-toggle-btn:hover {
          background: var(--surface-2);
          color: var(--text-primary);
        }
        .theme-toggle-btn:active {
          transform: scale(0.92);
        }
      `}</style>
    </button>
  )
}

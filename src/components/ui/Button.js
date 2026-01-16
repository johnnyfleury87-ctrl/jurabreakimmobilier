import styles from './Button.module.css'
import Link from 'next/link'

/**
 * Composant Button réutilisable
 * @param {string} variant - primary | secondary | ghost | danger
 * @param {string} size - sm | md | lg
 * @param {string} href - Si fourni, rend un Link Next.js
 * @param {boolean} fullWidth - Largeur 100%
 * @param {boolean} disabled - État désactivé
 * @param {function} onClick - Handler de clic
 * @param {string} type - button | submit | reset
 */
export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  href,
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ')

  if (href && !disabled) {
    return (
      <Link href={href} className={classNames} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

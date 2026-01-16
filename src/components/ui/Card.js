import styles from './Card.module.css'

/**
 * Composant Card réutilisable
 * @param {boolean} hoverable - Active l'effet hover
 * @param {boolean} clickable - Active l'effet clickable
 * @param {function} onClick - Handler de clic
 * @param {string} padding - none | sm | md | lg
 * @param {boolean} noBorder - Supprime la bordure
 */
export default function Card({ 
  children, 
  hoverable = false,
  clickable = false,
  onClick,
  padding = 'md',
  noBorder = false,
  className = '',
  ...props 
}) {
  const classNames = [
    styles.card,
    hoverable && styles.hoverable,
    clickable && styles.clickable,
    styles[`padding-${padding}`],
    noBorder && styles.noBorder,
    className
  ].filter(Boolean).join(' ')

  const handleClick = clickable && onClick ? onClick : undefined
  const role = clickable ? 'button' : undefined
  const tabIndex = clickable ? 0 : undefined

  return (
    <div 
      className={classNames} 
      onClick={handleClick}
      role={role}
      tabIndex={tabIndex}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Card Header
 */
export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`${styles.cardHeader} ${className}`} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Content
 */
export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`${styles.cardContent} ${className}`} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Footer
 */
export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`${styles.cardFooter} ${className}`} {...props}>
      {children}
    </div>
  )
}

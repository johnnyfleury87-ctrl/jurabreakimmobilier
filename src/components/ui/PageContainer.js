import styles from './PageContainer.module.css'

/**
 * Conteneur de page standardisé
 * @param {string} maxWidth - sm | md | lg | xl | 2xl | full
 * @param {string} spacing - none | sm | md | lg | xl
 * @param {boolean} centered - Centre le contenu verticalement
 * @param {string} background - white | gray | transparent
 */
export default function PageContainer({ 
  children, 
  maxWidth = 'xl',
  spacing = 'lg',
  centered = false,
  background = 'transparent',
  className = '',
  ...props 
}) {
  const classNames = [
    styles.pageContainer,
    styles[`maxWidth-${maxWidth}`],
    styles[`spacing-${spacing}`],
    styles[`bg-${background}`],
    centered && styles.centered,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} {...props}>
      <div className={styles.inner}>
        {children}
      </div>
    </div>
  )
}

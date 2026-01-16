import styles from './SectionTitle.module.css'

/**
 * Composant SectionTitle réutilisable
 * @param {string} level - h1 | h2 | h3 | h4
 * @param {string} align - left | center | right
 * @param {string} subtitle - Sous-titre optionnel
 * @param {string} supertitle - Sur-titre optionnel (petit texte au-dessus)
 * @param {string} spacing - none | sm | md | lg
 */
export default function SectionTitle({ 
  children, 
  level = 'h2',
  align = 'left',
  subtitle,
  supertitle,
  spacing = 'md',
  className = '',
  ...props 
}) {
  const Tag = level
  
  const classNames = [
    styles.sectionTitle,
    styles[`align-${align}`],
    styles[`spacing-${spacing}`],
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} {...props}>
      {supertitle && (
        <p className={styles.supertitle}>{supertitle}</p>
      )}
      <Tag className={styles.title}>
        {children}
      </Tag>
      {subtitle && (
        <p className={styles.subtitle}>{subtitle}</p>
      )}
    </div>
  )
}

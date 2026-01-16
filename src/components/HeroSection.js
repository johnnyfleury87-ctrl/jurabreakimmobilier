import Image from 'next/image'
import { Button } from '@/components/ui'
import HeroVideo from '@/components/HeroVideo'
import styles from './HeroSection.module.css'

/**
 * Composant HeroSection réutilisable
 * Utilisé sur la home, honoraires, et autres pages principales
 * 
 * @param {string} title - Titre H1 principal
 * @param {string} subtitle - Sous-titre
 * @param {Array} buttons - Tableau d'objets {href, label, variant, size}
 * @param {string} imageSrc - Chemin vers l'image (optionnel)
 * @param {string} imageAlt - Texte alternatif de l'image
 * @param {boolean} showVideo - Afficher la vidéo de fond (défaut: false)
 * @param {string} minHeight - Hauteur minimale (défaut: '60vh')
 */
export default function HeroSection({
  title,
  subtitle,
  buttons = [],
  imageSrc,
  imageAlt = '',
  showVideo = false,
  minHeight = '60vh'
}) {
  return (
    <section className={styles.hero} style={{ minHeight }}>
      {/* Vidéo d'arrière-plan (optionnel) */}
      {showVideo && <HeroVideo />}
      
      {/* Overlay vert */}
      <div className={styles.heroOverlay}></div>
      
      {/* Motif géométrique hexagonal */}
      <div className={styles.heroPattern}></div>
      
      <div className={styles.heroContent}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>{title}</h1>
          
          {subtitle && (
            <p className={styles.heroSubtitle}>{subtitle}</p>
          )}
          
          {buttons.length > 0 && (
            <div className={styles.heroButtons}>
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  href={button.href}
                  variant={button.variant || 'primary'}
                  size={button.size || 'lg'}
                  className={button.variant === 'primary' ? styles.ctaButton : ''}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        <div className={styles.heroRight}>
          {imageSrc && (
            <div className={styles.heroImageWrapper}>
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={400}
                height={400}
                className={styles.heroImage}
                priority
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import styles from './AnnonceMedia.module.css'

/**
 * Composant AnnonceMedia - Gestion intelligente de l'affichage des photos d'annonces
 * 
 * @param {Array} photos - Tableau des photos de l'annonce
 * @param {string} mode - Mode d'affichage ('statique', 'dynamique', 'film', 'focus', 'hover')
 * @param {string} alt - Texte alternatif pour l'accessibilité
 * @param {boolean} priority - Chargement prioritaire de l'image
 */
export default function AnnonceMedia({ 
  photos = [], 
  mode = 'statique',
  alt = '',
  priority = false 
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const intervalRef = useRef(null)

  // Vérifier préférence utilisateur pour les animations
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Si pas de photos, retourner null
  if (!photos || photos.length === 0) {
    return null
  }

  // Si une seule photo ou préférence animations réduites, toujours mode statique
  if (photos.length === 1 || prefersReducedMotion) {
    return (
      <div className={styles.container}>
        <Image
          src={photos[0].url}
          alt={alt}
          fill
          className={styles.image}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    )
  }

  // Gestion des différents modes
  const renderMode = () => {
    switch (mode) {
      case 'dynamique':
        return <ModeDynamique 
          photos={photos} 
          alt={alt} 
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          intervalRef={intervalRef}
        />

      case 'film':
        return <ModeFilm 
          photos={photos} 
          alt={alt} 
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          intervalRef={intervalRef}
        />

      case 'focus':
        return <ModeFocus 
          photos={photos} 
          alt={alt} 
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          intervalRef={intervalRef}
        />

      case 'hover':
        return <ModeHover 
          photos={photos} 
          alt={alt} 
          isHovered={isHovered}
          setIsHovered={setIsHovered}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          intervalRef={intervalRef}
        />

      case 'statique':
      default:
        return <ModeStatique photos={photos} alt={alt} priority={priority} />
    }
  }

  return (
    <div className={styles.container}>
      {renderMode()}
    </div>
  )
}

// ============================================
// MODE STATIQUE - Photo principale uniquement
// ============================================
function ModeStatique({ photos, alt, priority }) {
  return (
    <Image
      src={photos[0].url}
      alt={alt}
      fill
      className={styles.image}
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}

// ============================================
// MODE DYNAMIQUE - Carousel discret
// ============================================
function ModeDynamique({ photos, alt, currentIndex, setCurrentIndex, intervalRef }) {
  useEffect(() => {
    // Défilement automatique toutes les 4 secondes
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
    }, 4000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [photos.length, setCurrentIndex, intervalRef])

  return (
    <>
      {photos.map((photo, index) => (
        <Image
          key={photo.id}
          src={photo.url}
          alt={`${alt} - Photo ${index + 1}`}
          fill
          className={`${styles.image} ${styles.fadeTransition} ${
            index === currentIndex ? styles.active : styles.inactive
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ))}
      <div className={styles.indicators}>
        {photos.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentIndex ? styles.indicatorActive : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Photo ${index + 1}`}
          />
        ))}
      </div>
    </>
  )
}

// ============================================
// MODE FILM - Défilement continu rapide
// ============================================
function ModeFilm({ photos, alt, currentIndex, setCurrentIndex, intervalRef }) {
  useEffect(() => {
    // Défilement rapide et fluide toutes les 2 secondes
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
    }, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [photos.length, setCurrentIndex, intervalRef])

  return (
    <>
      {photos.map((photo, index) => (
        <Image
          key={photo.id}
          src={photo.url}
          alt={`${alt} - Photo ${index + 1}`}
          fill
          className={`${styles.image} ${styles.slideTransition} ${
            index === currentIndex ? styles.active : styles.inactive
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ))}
    </>
  )
}

// ============================================
// MODE FOCUS - Changement fade alterné
// ============================================
function ModeFocus({ photos, alt, currentIndex, setCurrentIndex, intervalRef }) {
  useEffect(() => {
    // Changement lent toutes les 5 secondes
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [photos.length, setCurrentIndex, intervalRef])

  return (
    <Image
      key={photos[currentIndex].id}
      src={photos[currentIndex].url}
      alt={`${alt} - Photo ${currentIndex + 1}`}
      fill
      className={`${styles.image} ${styles.focusFade}`}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}

// ============================================
// MODE HOVER - Animation au survol uniquement (desktop)
// ============================================
function ModeHover({ photos, alt, isHovered, setIsHovered, currentIndex, setCurrentIndex, intervalRef }) {
  useEffect(() => {
    if (!isHovered) {
      // Arrêter l'animation si pas survolé
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setCurrentIndex(0) // Revenir à la première photo
      return
    }

    // Démarrer l'animation au survol
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
    }, 1500)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovered, photos.length, setCurrentIndex, intervalRef])

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={styles.hoverContainer}
    >
      {photos.map((photo, index) => (
        <Image
          key={photo.id}
          src={photo.url}
          alt={`${alt} - Photo ${index + 1}`}
          fill
          className={`${styles.image} ${styles.fadeTransition} ${
            index === currentIndex ? styles.active : styles.inactive
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ))}
      {!isHovered && photos.length > 1 && (
        <div className={styles.hoverHint}>
          {photos.length} photos
        </div>
      )}
    </div>
  )
}

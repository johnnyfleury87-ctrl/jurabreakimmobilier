'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './HeroVideo.module.css'

export default function HeroVideo() {
  const videoRef = useRef(null)
  const [canPlay, setCanPlay] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Vérifier si l'utilisateur préfère réduire les animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setCanPlay(false)
      return
    }

    // Tenter de lancer la vidéo manuellement pour iOS/mobile
    const playPromise = video.play()
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Autoplay bloqué (probablement mobile)
        console.log('Autoplay bloqué, fallback sur fond statique:', error.message)
        setCanPlay(false)
      })
    }
  }, [])

  return (
    <>
      {canPlay && (
        <video
          ref={videoRef}
          className={styles.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      )}
    </>
  )
}

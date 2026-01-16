'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import styles from './PageTransition.module.css'

/**
 * Wrapper pour animer les transitions entre les pages
 * À utiliser dans app/template.js
 */
export default function PageTransition({ children }) {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    // Scroll to top lors du changement de page
    if (pathname !== prevPathname.current) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      prevPathname.current = pathname
    }
  }, [pathname])

  return (
    <div className={styles.pageTransition} key={pathname}>
      {children}
    </div>
  )
}

'use client'

import { PageContainer } from '@/components/ui'
import EstimationForm from '@/components/estimation/EstimationForm'
import styles from './page.module.css'

/**
 * Page Estimation - Parcours complet en 6 étapes
 * Conforme à docs/estimation.md
 */
export default function EstimationPage() {
  return (
    <PageContainer
      title="Estimation immobilière"
      subtitle="Obtenez une estimation de votre bien en suivant notre parcours sécurisé"
    >
      <div className={styles.pageContent}>
        <EstimationForm />
      </div>
    </PageContainer>
  )
}

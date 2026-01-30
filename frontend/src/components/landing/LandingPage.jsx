import React from 'react'
import { Layout, DashboardLayout } from '../layout/Layout'
import { Hero } from './Hero'
import { Features } from './Features'
import { CTA } from './CTA'

const LandingPage = () => {
  return (
    <div>
      <Layout>
        <Hero />
        <Features />
        <CTA />
      </Layout>
    </div>
  )
}

export default LandingPage
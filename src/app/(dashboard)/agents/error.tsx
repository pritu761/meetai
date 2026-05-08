"use client"
import { ErrorState } from '@/components/error-state'
import React from 'react'
function errorpage() {
  return (
    <ErrorState
    title='Error Loading Agents'
    description='There was an error loading the agents. Please try again later.'/>
  )
}

export default errorpage
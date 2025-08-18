import { AgentsView, AgentsViewLoading } from '@/modules/agents/server/ui/views/agents-view'
import { getQueryClient, trpc } from '@/trpc/server'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import {ErrorBoundary} from "react-error-boundary"
import React, { Suspense } from 'react'

const page = async () => {
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions())
  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AgentsViewLoading />}>
        <ErrorBoundary fallback={<AgentsViewLoading />}>
        <AgentsView />
        </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </div>
  )
}

export default page

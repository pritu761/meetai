import { AgentsView, AgentsViewLoading } from '@/modules/agents/server/ui/views/agents-view'
import { getQueryClient, trpc } from '@/trpc/server'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import {ErrorBoundary} from "react-error-boundary"
import React, { Suspense } from 'react'
import { AgentsListHeader } from '@/modules/agents/ui/components/agents-list-header'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { SearchParams } from 'nuqs'
import { loadSearchParams } from '@/modules/agents/params'

interface Props {
  searchParams : Promise<SearchParams>
}
const page = async ({searchParams}: Props) => {
  const filters = await loadSearchParams(searchParams)
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect("/sign-up");
  }
  
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({
    ...filters
  }))
  return (
    <div>
      <AgentsListHeader />
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

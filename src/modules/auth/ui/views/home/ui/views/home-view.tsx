"use client"

import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"

export const HomeView = () => {
  const trpc = useTRPC()
  const {data} = useQuery(trpc.hello.queryOptions({ text:"Pritam"}))

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-lg text-amber-700">{data?.greeting}</p>
    </div>
  )
}


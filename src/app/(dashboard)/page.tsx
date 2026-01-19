import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { PlusIcon, Bot } from "lucide-react";
import { get } from "http";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { DashboardStats } from "@/modules/dashboard/ui/components/dashboard-stats";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect("/sign-in");
  }
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({}))
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your AI agent management dashboard</p>
      </div>
      
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardStats />
      </HydrationBoundary>
    </div>
  );
};

export default Page;

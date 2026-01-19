"use client"

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusIcon, Bot } from "lucide-react";
import { useState } from "react";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";
import { useRouter } from "next/navigation";

export const DashboardStats = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions({}));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const totalAgents = data?.total || 0;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="h-8 w-8 text-blue-600" />
            <h2 className="text-lg font-semibold">My Agents</h2>
          </div>
          <p className="text-gray-600 mb-4">Create and manage your AI agents</p>
          <Button 
            className="w-full"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Agents:</span>
              <span className="font-medium">{totalAgents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Sessions:</span>
              <span className="font-medium">0</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>
      </div>

      <NewAgentDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
};

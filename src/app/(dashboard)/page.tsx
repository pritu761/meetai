import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { PlusIcon, Bot } from "lucide-react";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect("/sign-in");
  }
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your AI agent management dashboard</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="h-8 w-8 text-blue-600" />
            <h2 className="text-lg font-semibold">My Agents</h2>
          </div>
          <p className="text-gray-600 mb-4">Create and manage your AI agents</p>
          <Button className="w-full">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Agents:</span>
              <span className="font-medium">0</span>
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
    </div>
  );
};

export default Page;

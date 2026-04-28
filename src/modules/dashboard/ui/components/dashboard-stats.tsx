"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bot, Video, CalendarPlus, ArrowRight } from "lucide-react";
import { useState } from "react";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";
import { NewMeetingDialog } from "@/modules/meetings/ui/components/new-meeting-dialog";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const DashboardStats = () => {
  const trpc = useTRPC();
  const { data: agentsData } = useSuspenseQuery(trpc.agents.getMany.queryOptions({}));
  const { data: meetingsData } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({ page: 1, pageSize: 5 })
  );

  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);

  const totalAgents = agentsData?.total || 0;
  const totalMeetings = meetingsData?.total || 0;

  return (
    <>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your meetings and agents.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 dark:from-blue-950/30 dark:to-blue-900/10 dark:border-blue-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Schedule Meeting</p>
                  <p className="text-xs text-blue-600/60 dark:text-blue-400/60 mt-0.5">Create a new meeting</p>
                </div>
                <Button size="sm" className="rounded-lg" onClick={() => setIsMeetingDialogOpen(true)}>
                  <CalendarPlus className="mr-1 w-4 h-4" />
                  New
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50 dark:from-emerald-950/30 dark:to-emerald-900/10 dark:border-emerald-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Create Agent</p>
                  <p className="text-xs text-emerald-600/60 dark:text-emerald-400/60 mt-0.5">Build an AI assistant</p>
                </div>
                <Button size="sm" className="rounded-lg" onClick={() => setIsAgentDialogOpen(true)}>
                  <Bot className="mr-1 w-4 h-4" />
                  New
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalMeetings}</p>
                  <p className="text-xs text-muted-foreground">Total Meetings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Bot className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalAgents}</p>
                  <p className="text-xs text-muted-foreground">AI Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Meetings</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/meetings" className="text-muted-foreground">
                View all <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </div>
          {meetingsData?.items && meetingsData.items.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {meetingsData.items.slice(0, 5).map(meeting => (
                    <Link key={meeting.id} href={`/meetings/${meeting.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{meeting.name}</p>
                          <p className="text-xs text-muted-foreground">{meeting.agent?.name || "No agent"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          meeting.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          meeting.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          meeting.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>{meeting.status}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Video className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No meetings yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Create your first meeting to get started</p>
                <Button size="sm" className="mt-4" onClick={() => setIsMeetingDialogOpen(true)}>
                  <CalendarPlus className="mr-1 w-4 h-4" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <NewAgentDialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen} />
      <NewMeetingDialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen} />
    </>
  );
};
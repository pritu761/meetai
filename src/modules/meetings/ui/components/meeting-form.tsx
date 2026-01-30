import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../../schema";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTRPC } from "@/trpc/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AgentForm } from "@/modules/agents/ui/components/agent-form";

// Client-side form schema with Date objects
const meetingsFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  agentId: z.string().min(1, { message: "Agent is required" }),
  instructions: z.string().min(1, { message: "Instructions are required" }),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date({ message: "End date is required" }),
});


interface MeetingFormProps {
    onSuccess: (id?: string) => void;
    onCancel: () => void;
    initialValues?:{
        id?: string;
        name: string;
        agentId: string;
        instructions: string;
        startDate: Date;
        endDate: Date;
    };
}

export const MeetingForm = ({onSuccess, onCancel, initialValues}: MeetingFormProps) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [agentSearch, setAgentSearch] = useState("");
    const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);

    const agents = useQuery(
        trpc.agents.getMany.queryOptions({
            page: 1,
            pageSize: 100,
            search: agentSearch
        })
    );

    const createMeeting = useMutation(trpc.meetings.create.mutationOptions({
        onSuccess: async(data) => {
            queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
            toast.success("Meeting created successfully");
            onSuccess?.(data.id);
        },
        onError: () => {
            toast.error("Failed to create meeting");
        }
    }));

    const updateMeeting = useMutation(trpc.meetings.update.mutationOptions({
        onSuccess: async() => {
            queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
            if(initialValues?.id){
                queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({id:initialValues.id}));
            }
            toast.success("Meeting updated successfully");
            onSuccess?.();
        },
        onError: () => {
            toast.error("Failed to update meeting");
        }
    }));

    const isEdit = !!initialValues?.id;

    const form = useForm<z.infer<typeof meetingsFormSchema>>({
        resolver:zodResolver(meetingsFormSchema),
        defaultValues:{
            name:initialValues?.name??"",
            agentId:initialValues?.agentId??"",
            instructions:initialValues?.instructions??"",
            startDate:initialValues?.startDate ?? new Date(),
            endDate:initialValues?.endDate ?? new Date(Date.now() + 3600000), // 1 hour from now
        },
    })

    const isPending = createMeeting.isPending || updateMeeting.isPending;

    const onSubmit = (data: z.infer<typeof meetingsFormSchema>) => {
        console.log("=== FORM SUBMIT DEBUG ===");
        console.log("Form data:", data);
        console.log("StartDate:", data.startDate, typeof data.startDate);
        console.log("EndDate:", data.endDate, typeof data.endDate);
        
        // Convert dates to ISO strings for transmission
        const submitData = {
            name: data.name,
            agentId: data.agentId,
            instructions: data.instructions,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
        };
        
        if(isEdit && initialValues?.id){
            updateMeeting.mutate({
                ...submitData,
                id: initialValues.id
            });
        }else{
            createMeeting.mutate(submitData)
        }
    }

    return (
       <>
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Meeting Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Math Consultations" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="agentId"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Agent</FormLabel>
                            <FormControl>
                                <CommandSelect
                                    options={(agents.data?.items ?? []).map((agent) => ({
                                        id: agent.id,
                                        value: agent.id,
                                        children: (
                                            <div className="flex items-center gap-x-2">
                                                <GeneratedAvatar seed={agent.name} variant="bottts" />
                                                <span>{agent.name}</span>
                                            </div>
                                        )
                                    }))}
                                    value={field.value}
                                    onSelect={field.onChange}
                                    onSearch={setAgentSearch}
                                    placeholder="Select an agent"
                                />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                                Not found what you're looking for?{" "}
                                <button
                                    type="button"
                                    onClick={() => setIsAgentDialogOpen(true)}
                                    className="text-primary hover:underline"
                                >
                                    Create new agent
                                </button>
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="instructions"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Instructions for the agent during the meeting" rows={4} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Start Date & Time</FormLabel>
                            <FormControl>
                                <Input 
                                    type="datetime-local" 
                                    value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ""}
                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="endDate"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>End Date & Time</FormLabel>
                            <FormControl>
                                <Input 
                                    type="datetime-local" 
                                    value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ""}
                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-x-2">
                    {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
                    <Button type="submit" disabled={isPending}>{isEdit ? "Update" : "Create"}</Button>
                </div>
            </form>
        </Form>
        
        <ResponsiveDialog
            title="Create New Agent"
            description="Create a new agent to use in your meeting"
            open={isAgentDialogOpen}
            onOpenChange={setIsAgentDialogOpen}
        >
            <AgentForm
                onSuccess={() => {
                    queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
                    setIsAgentDialogOpen(false);
                    toast.success("Agent created! You can now select it.");
                }}
                onCancel={() => setIsAgentDialogOpen(false)}
            />
        </ResponsiveDialog>
       </>
    )
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agentInsertSchema } from "../../schema";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTRPC } from "@/trpc/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


interface AgentFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialValues?:any;
}

export const AgentForm = ({onSuccess, onCancel, initialValues}: AgentFormProps) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();

    const createAgent = useMutation(trpc.agents.create.mutationOptions({
        onSuccess: async() => {
            queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));

            if(initialValues?.id){
                queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({id:initialValues.id}));
            }
            onSuccess?.();
        },
        onError: () => {
            toast.error("Failed to create agent");
        }
    }));

    const form = useForm<z.infer<typeof agentInsertSchema>>({
        resolver:zodResolver(agentInsertSchema),
        defaultValues:{
            name:initialValues?.name??"",
            instructions:initialValues?.instructions??"",
        },
    })

    const isEdit = !!initialValues?.id;
    const isPending = createAgent.isPending;

    const onSubmit = (data:z.infer<typeof agentInsertSchema>) => {
        if(isEdit){
            console.log("edit");
        }else{
            createAgent.mutate(data)
        }
    }

    return (
       <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <GeneratedAvatar seed={form.watch("name")} variant="bottts"/>
            <FormField
                control={form.control}
                name="name"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Agent Name" />
                        </FormControl>
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
                            <Textarea {...field} placeholder="Agent Instructions" />
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
    )
}


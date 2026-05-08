import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agentInsertSchema, agentupdateSchema } from "../../schema";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTRPC } from "@/trpc/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


interface AgentFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialValues?:{
        id?: string;
        name: string;
        instructions: string;
    };
}

export const AgentForm = ({onSuccess, onCancel, initialValues}: AgentFormProps) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();

    const createAgent = useMutation(trpc.agents.create.mutationOptions({
        onSuccess: async() => {
            queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
            toast.success("Agent created successfully");
            onSuccess?.();
        },
        onError: () => {
            toast.error("Failed to create agent");
        }
    }));

    const updateAgent = useMutation(trpc.agents.update.mutationOptions({
        onSuccess: async() => {
            queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
            if(initialValues?.id){
                queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({id:initialValues.id}));
            }
            toast.success("Agent updated successfully");
            onSuccess?.();
        },
        onError: () => {
            toast.error("Failed to update agent");
        }
    }));

    const isEdit = !!initialValues?.id;

    const form = useForm<z.infer<typeof agentInsertSchema>>({
        resolver:zodResolver(agentInsertSchema),
        defaultValues:{
            name:initialValues?.name??"",
            instructions:initialValues?.instructions??"",
            model:initialValues?.model?? "google/gemini-2.0-flash-001",
        },
    })

    const isPending = createAgent.isPending || updateAgent.isPending;

    const onSubmit = (data:z.infer<typeof agentInsertSchema>) => {
        if(isEdit && initialValues?.id){
            updateAgent.mutate({
                ...data,
                id: initialValues.id
            });
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
                 name="model"
                 render={({field}) => (
                     <FormItem>
                         <FormLabel>AI Model</FormLabel>
                         <FormControl>
                             <Select {...field} placeholder="Select a model">
                                 <Select.Value placeholder="Select a model" />
                                 <Select.Content>
                                     {/* Free Models */}
                                     <Select.Item value="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free">NVIDIA Nemotron 3 Nano Omni (Free)</Select.Item>
                                     <Select.Item value="nvidia/nemotron-3-super-120b-a12b:free">NVIDIA Nemotron 3 Super (Free)</Select.Item>
                                     <Select.Item value="nvidia/nemotron-3-nano-30b-a3b:free">NVIDIA Nemotron 3 Nano 30B A3B (Free)</Select.Item>
                                     <Select.Item value="nvidia/nemotron-nano-12b-v2-vl:free">NVIDIA Nemotron Nano 12B 2 VL (Free)</Select.Item>
                                     <Select.Item value="nvidia/nemotron-nano-9b-v2:free">NVIDIA Nemotron Nano 9B V2 (Free)</Select.Item>
                                     <Select.Item value="qwen/qwen3-coder:free">Qwen3 Coder 480B A35B (Free)</Select.Item>
                                     <Select.Item value="qwen/qwen3-next-80b-a3b-instruct:free">Qwen3 Next 80B A3B Instruct (Free)</Select.Item>
                                     <Select.Item value="meta-llama/llama-3.3-70b-instruct:free">Meta Llama 3.3 70B Instruct (Free)</Select.Item>
                                     <Select.Item value="meta-llama/llama-3.2-3b-instruct:free">Meta Llama 3.2 3B Instruct (Free)</Select.Item>
                                     <Select.Item value="nousresearch/hermes-3-llama-3.1-405b:free">Nous Hermes 3 405B Instruct (Free)</Select.Item>
                                     <Select.Item value="openai/gpt-oss-120b:free">OpenAI GPT-OSS 120B (Free)</Select.Item>
                                     <Select.Item value="openai/gpt-oss-20b:free">OpenAI GPT-OSS 20B (Free)</Select.Item>
                                     <Select.Item value="google/gemma-4-26b-a4b-it:free">Google Gemma 4 26B A4B (Free)</Select.Item>
                                     <Select.Item value="google/gemma-4-31b-it:free">Google Gemma 4 31B (Free)</Select.Item>
                                     <Select.Item value="z-ai/glm-4.5-air:free">Z.ai GLM 4.5 Air (Free)</Select.Item>
                                     <Select.Item value="liquid/lfm-2.5-1.2b-thinking:free">LiquidAI LFM2.5-1.2B-Thinking (Free)</Select.Item>
                                     <Select.Item value="liquid/lfm-2.5-1.2b-instruct:free">LiquidAI LFM2.5-1.2B-Instruct (Free)</Select.Item>
                                     <Select.Item value="openrouter/owl-alpha">Owl Alpha</Select.Item>
                                     <Select.Item value="openrouter/free">Free Models Router</Select.Item>
                                     
                                     {/* Premium Models (for reference) */}
                                     <Select.Item value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</Select.Item>
                                     <Select.Item value="google/gemini-pro-1.5">Gemini Pro 1.5</Select.Item>
                                     <Select.Item value="mistralai/mistral-7b-instruct-v0.2">Mistral 7B Instruct v0.2</Select.Item>
                                     <Select.Item value="mistralai/mixtral-8x7b-instruct-v0.1">Mixtral 8x7B Instruct v0.1</Select.Item>
                                     <Select.Item value="openchat/openchat-7b-v3.5">OpenChat 7B v3.5</Select.Item>
                                     <Select.Item value="nousresearch/hermes-2-pro-mistral-7b">Hermes 2 Pro Mistral 7B</Select.Item>
                                     <Select.Item value="meta-llama/llama-3-8b-instruct">Llama 3 8B Instruct</Select.Item>
                                     <Select.Item value="meta-llama/llama-3-70b-instruct">Llama 3 70B Instruct</Select.Item>
                                     <Select.Item value="anthropic/claude-3-haiku">Claude 3 Haiku</Select.Item>
                                     <Select.Item value="anthropic/claude-3-sonnet">Claude 3 Sonnet</Select.Item>
                                 </Select.Content>
                             </Select>
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


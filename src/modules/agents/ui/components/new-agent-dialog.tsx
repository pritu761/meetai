import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { AgentForm } from "./agent-form";

interface NewAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const NewAgentDialog = ({ 
    open, 
    onOpenChange }: NewAgentDialogProps) => {
        const [name, setName] = useState("");
        const [instructions, setInstructions] = useState("");

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            // TODO: Implement agent creation
            console.log({ name, instructions });
            onOpenChange(false);
            setName("");
            setInstructions("");
        };

        return(
            <ResponsiveDialog 
                title=""
                open={open}
                onOpenChange={onOpenChange}
            >
                <AgentForm
                    onSuccess={() => {
                        onOpenChange(false);
                    }}
                    onCancel={() => {
                        onOpenChange(false);
                    }}
                />
            </ResponsiveDialog>
        )
    }
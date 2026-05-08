import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AgentForm } from "./agent-form";

interface UpdateAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValues?: {
        id: string;
        name: string;
        instructions: string;
    };
}

export const UpdateAgentDialog = ({ 
    open, 
    onOpenChange,
    initialValues
}: UpdateAgentDialogProps) => {
    return(
        <ResponsiveDialog 
            title="Edit Agent"
            description="Update your agent's name and instructions"
            open={open}
            onOpenChange={onOpenChange}
        >
            <AgentForm
                initialValues={initialValues}
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
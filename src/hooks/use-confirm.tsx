import {Button} from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import {JSX, useState} from "react";


export const useConfirm = (
    title: string,
    description: string,
) : [() => JSX.Element, () => Promise<unknown>] => {
    const [promise,setPromise]  = useState<{
        resolve: (value: boolean) => void;

    }| null>(null);

    const confirm = ()=>{
        return new Promise((resolve) => {
            setPromise({
                resolve
            })
        })
    }

    const handleclose = () => (
        setPromise(null)
    )
    ;

    const handleConfirm = () => {
        promise?.resolve(true);
        handleclose();
    }

    const handleCancel = () => {
        promise?.resolve(false);
        handleclose();
    }

    const ConfirmationDialog = () => (
        <ResponsiveDialog 
            title={title}
            description={description}
            open={promise !== null}
            onOpenChange={handleclose}
        >
           <div className="pt-4 w-full flex flex-col-reverse gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
  <Button
    onClick={handleCancel}
    variant="outline"
    className="w-full lg:w-auto"
  >
    Cancel
  </Button>

  <Button
    onClick={handleConfirm}
    className="w-full lg:w-auto bg-green-600 hover:bg-green-900 active:bg-green-800 text-white"
  >
    Confirm
  </Button>
</div>

        </ResponsiveDialog>
    )

    return [ConfirmationDialog, confirm]
}
    

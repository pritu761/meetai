
import Image from "next/image";

interface Props{
    title:string;
    description?:string;
    image?:string;
}

export const EmptyState  = ({title, description, image = "/empty.svg"}:Props) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
            <Image src={image} alt="Empty" width={240} height={240} />
            <div className="flex flex-col gap-y-6 max-w-md mx-auto text-center">
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}
            </div>
        </div>
    );
}

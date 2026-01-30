import {createAvatar} from '@dicebear/core';
import {botttsNeutral,initials} from '@dicebear/collection';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface GeneratedAvatarProps {
    seed: string;
    className?: string;
    variant?: 'bottts' | 'initials';
}

export const GeneratedAvatar = ({
    seed,
    className,
    variant
}: GeneratedAvatarProps) => {
    let avatar;

    if(variant === "bottts"){
        avatar = createAvatar(botttsNeutral, {
            seed,
            
        });
    }
    else {
        avatar = createAvatar(initials, {
            seed,
            fontWeight: 500,
            fontSize: 42,
        });
}

return (
    <Avatar className={cn("h-10 w-10", className)}>
        <AvatarImage src={avatar.toDataUri()} alt={seed} />
        <AvatarFallback >
            {seed.charAt(0).toUpperCase()}
        </AvatarFallback>
    </Avatar>
    );
};
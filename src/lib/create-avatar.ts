import { createAvatar } from "@dicebear/core";
import * as collection from "@dicebear/collection";

type AvatarVariant = keyof typeof collection;

interface GenerateAvatarUriOptions {
    seed: string;
    variant?: AvatarVariant;
}

export function generateAvatarUri(
    options: GenerateAvatarUriOptions | string
): string {
    // Handle both string and object inputs
    const seed = typeof options === "string" ? options : options.seed;
    const variant = typeof options === "string" ? "initials" : (options.variant || "initials");

    // Get the style from the collection
    const style = collection[variant as AvatarVariant];

    if (!style) {
        throw new Error(`Invalid avatar variant: ${variant}`);
    }

    // Generate the avatar and return as data URI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avatar = createAvatar(style as any, {
        seed,
    });

    return avatar.toDataUri();
}

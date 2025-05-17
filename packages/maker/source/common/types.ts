import type { readItemData } from "source/utilities/get-all-items";

export type Validator =
{
    id: string;
    message?: string;

    /**
     * @returns `true` if the text is valid, otherwise a message to show to the user. If returns `false`, the `message` property cannot be `undefined` and will be shown to the user.
     */
    validate: (text: string, options: { type: Exclude<ReturnType<typeof readItemData>, null>["type"]}) => string | boolean;
}
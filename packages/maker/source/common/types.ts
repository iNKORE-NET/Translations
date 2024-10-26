export type Validator =
{
    id: string;
    message?: string;

    /**
     * @returns `true` if the text is valid, otherwise a message to show to the user. If returns `false`, the `message` property cannot be `undefined` and will be shown to the user.
     */
    validate: (text: string) => string | boolean;
}
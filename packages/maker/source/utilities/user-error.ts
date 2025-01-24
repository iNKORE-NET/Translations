
/**
 * This error means it is caused by the misoperation of the user, which is not a bug or an unexpected error.
 * When this error is thrown, the program should display the error message to the user without the stack trace.
 */
export class UserError extends Error
{
    constructor(message: string)
    {
        super(message);
        this.name = "UserError";
    }
}
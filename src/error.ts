/** This error happens when an invalid timestamp is supplied. */
class InvalidTimestampError<T extends number | string | Date> extends Error {
    name = 'InvalidTimestampError';
    message!: `invalid timestamp: ${string}`;

    constructor(readonly timestamp: T) {
        super(`invalid timestamp ${timestamp}`);
    }
}

export { InvalidTimestampError };

declare module 'bcryptjs' {
    /**
     * Generate a hash for the given string.
     * @param s String to hash
     * @param salt Salt length to generate or salt to use
     */
    export function hash(s: string, salt: string | number): Promise<string>;

    /**
     * Generate a salt with the given number of rounds.
     * @param rounds Number of rounds to use
     */
    export function genSalt(rounds?: number): Promise<string>;

    /**
     * Compare the given data against the given hash.
     * @param s Data to compare
     * @param hash Hash to compare against
     */
    export function compare(s: string, hash: string): Promise<boolean>;
}

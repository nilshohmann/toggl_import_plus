/**
 * Model for credentials
 */
export class Credentials {

    /** Username */
    public username: string;

    /** Password */
    public password: string;

    /**
     * Contructor
     *
     * @param username Username
     * @param password Password
     */
    public constructor(username: string = null, password: string = null) {
        this.username = username;
        this.password = password;
    }
}

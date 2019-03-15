export class Onboarding {
    /**
     * @property {string} onboardingKey
     * The unique key associated with a specific onboarding process
     */
    onboardingKey: string;

    /**
     * @property {number} taskListId
     * The unique identifier associated with a specific onboarding task list
     */
    taskListId: number;

    /**
     * @property {string} emailAddress
     * The email address associated with the employee going through onboarding
     */
    emailAddress: string;

    /**
     * @property {string} name
     * The name of the employee going through onboarding
     */
    name: string;

    public constructor(init?: Partial<Onboarding>) {
        Object.assign(this, init);
    }
}

export enum RecipeFlagReason {
    /**
     * The recipe is not a recipe. This means that the recipe's instructions either do
     * not make sense at all or describe something else entirely besides cooking a meal.
     */
    NOT_A_RECIPE = 'not_a_recipe',
    /**
     * The recipe contains profanity.
     */
    PROFANITY = 'profanity',
    /**
     * The recipe contains any form of hate speech towards any group of people.
     */
    HATE_SPEECH = 'hate_speech',
    /**
     * The recipe contains any form of harassment towards any person.
     */
    HARASSMENT = 'harassment',
    /**
     * The recipe contains any description of violent content.
     */
    VIOLENT_CONTENT = 'violent_content',
    /**
     * The recipe contains any description of self-harm.
     */
    SELF_HARM = 'self_harm',
    /**
     * The recipe contains any description of an activity that is considered illegal
     * in most societies.
     */
    ILLEGAL_ACTIVITY = 'illegal_activity',
    /**
     * The recipe contains dangerous instructions. For example, drinking bleach or
     * eating glass are dangerous instructions.
     */
    DANGEROUS_INSTRUCTION = 'dangerous_instruction',
    /**
     * The recipe contains information that could lead to an identification of any
     * person, creator of the recipe or otherwise. This includes things like emails,
     * names, addresses etc. This does not include things like describing someone's
     * experiences or the kitchen they have.
     */
    PERSONAL_INFO = 'personal_info',
    /**
     * The recipe is spam, advertisement or any other similar form of obtrusive content.
     */
    SPAM = 'spam'
}

export type FlagReason = RecipeFlagReason;

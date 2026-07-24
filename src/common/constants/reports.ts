export enum ReportTargetType {
    RECIPE = 'recipe',
    COOKBOOK = 'cookbook',
    USER = 'user'
}

/**
 * These are self explanatory.
 * My first thought was to reuse the ai moderation pipeline categories,
 * but apparently there is not a 100% freedom in choosing these according to
 * the DSA, so this list is handpicked to be compliant with that.
 */
export enum ReportReason {
    ILLEGAL_CONTENT = 'illegal_content',
    HATE_SPEECH = 'hate_speech',
    HARASSMENT = 'harassment',
    SPAM = 'spam',
    SEXUAL_CONTENT = 'sexual_content',
    IP_INFRINGEMENT = 'ip_infringement',
    PERSONAL_DATA = 'personal_data',
    DANGEROUS = 'dangerous',
    OTHER = 'other'
}

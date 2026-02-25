export type ContactFormData = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

export type ContactFormPayload = ContactFormData & {
    captchaToken: string;
};

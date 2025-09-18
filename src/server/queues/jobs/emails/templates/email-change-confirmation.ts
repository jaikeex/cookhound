export const emailChangeConfirmationTemplate = (
    username: string,
    confirmationLink: string
) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Confirm your new email address</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>We received a request to change the email address associated with your Cookhound account.</p>
        <p>Please confirm this change by clicking the link below:</p>
        <p><a href="${confirmationLink}">Confirm my new email</a></p>
        <p>If you didn't request this change, you can safely ignore this email – your address will remain unchanged.</p>
        <p>Thanks,<br/>The Cookhound Team 🐾</p>
    </body>
</html>`;

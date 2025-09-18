export const emailChangedAuditTemplate = (
    username: string,
    newEmail: string
) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Your email was changed</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>This is a confirmation that the email address on your Cookhound account was successfully changed to ${newEmail}.</p>
        <p>If you did not perform this action, please contact support immediately.</p>
        <p>Bon Appétit!<br/>The Cookhound Team 🐾</p>
    </body>
</html>`;

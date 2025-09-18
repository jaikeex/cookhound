export const emailChangeNoticeTemplate = (username: string) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Email change requested</title>
    </head>
    <body>
        <p>Hi ${username},</p>
        <p>Someone (hopefully you) just requested to change the email address on your Cookhound account.</p>
        <p>If this was you, please check the inbox of your new address and follow the confirmation link.</p>
        <p>If you didn't make this request, you can ignore this message, or reset your password to secure your account.</p>
        <p>Best,<br/>The Cookhound Team 🐾</p>
    </body>
</html>`;

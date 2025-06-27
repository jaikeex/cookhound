export const resetPasswordTemplate = (
    username: string,
    resetPasswordLink: string
) => {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <title>Welcome to Cookhound.com!</title>
        </head>
        <body>
            <p>Hi ${username},</p>
            <p>You've recently requested to reset your password for your account at <strong>Cookhound.com</strong>. No worries, we've got you covered! 🛡️</p>

            <p>To set up a new password, just click on the link below:</p>

            <p><a href="${resetPasswordLink}">Reset My Password</a></p>

            <p>This link will expire in 24 hours for security reasons. If you did not request a password reset, please ignore this email or contact us if you have any concerns about your account's security.</p>

            <p>If you have any issues or need further assistance, our customer service team is here to help and eager to get you back to exploring new recipes and cooking amazing dishes.</p>

            <p>Happy Cooking,</p>
            <p>The Cookhound Team 🐾</p>

            <p>P.S. Remember, this link is as perishable as fresh produce! Make sure to use it before it expires.</p>
        </body>
    </html>

    `;
};

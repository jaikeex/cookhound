export const emailVerificationTemplate = (
    username: string,
    verificationLink: string
) => {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <title>Welcome to Cookhound.com!</title>
        </head>
        <body>
            <p>Hi ${username},</p>
            <p>Welcome to <strong>Cookhound.com</strong>, where flavors meet and culinary dreams come to life! 🌟 </p>
            <p>Before you tie your apron and sharpen your knives, there's just one small step we need you to take:</p>
            <p>Please verify your email address by clicking on the link below.</p>

            <p><a href="${verificationLink}">Verify My Email</a></p>

            <p>Once you’re verified, you’re ready to explore, create, and share your delicious dishes with the world. Get ready to inspire and be inspired!</p>
            <p>If you have any questions or stumble upon any recipe for disaster, feel free to reach out to as at jaikeex@cookhound.com</p>

            <p>Bon Appétit and Happy Cooking!</p>
            <p>The Cookhound Team 🐾</p>

            <p>P.S. If you didn’t sign up for Cookhound.com, you can safely ignore this email. But, you’ll be missing out on some seriously tasty treats!</p>
        </body>
    </html>

    `;
};

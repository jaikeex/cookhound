const fs = require('fs');
const path = require('path');

function copyDirectory(src, dest) {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Read source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    console.log('Copying public directory...');
    copyDirectory('./public', './.next/standalone/public');

    console.log('Copying static directory...');
    copyDirectory('./.next/static', './.next/standalone/.next/static');

    console.log('Successfully copied static files for standalone build!');
} catch (error) {
    console.error('Error copying files:', error);
    process.exit(1);
}

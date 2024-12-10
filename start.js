const { exec } = require('child_process');

// Start the server
exec('node ./server/server.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error starting server: ${error}`);
        return;
    }
    console.log(`Server output: ${stdout}`);
});

// Start ngrok tunnel
exec('node ./server/ngrok.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error starting ngrok: ${error}`);
        return;
    }
    console.log(`ngrok output: ${stdout}`);
});
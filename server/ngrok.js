const ngrok = require('ngrok');

(async function () {
    const url = await ngrok.connect(8080);  // Exposes port 8080
    console.log(`ngrok URL: ${url}`);
})();
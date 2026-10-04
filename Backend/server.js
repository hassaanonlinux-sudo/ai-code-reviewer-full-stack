// server.js
require('dotenv').config();
const app = require('./src/app');  // 👈 import the app

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
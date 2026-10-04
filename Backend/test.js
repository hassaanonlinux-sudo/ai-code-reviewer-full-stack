// test.js
const {generateContent} = require('./src/services/ai.service');

async function test() {
  try {
    console.log("⏳ Sending prompt to Gemini...");
    const response = await generateContent("Explain how AI works in a few words");
    console.log("✅ Response:\n", response);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}
test();
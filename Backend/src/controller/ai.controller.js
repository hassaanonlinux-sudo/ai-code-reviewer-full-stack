const aiService = require('../services/ai.service');

async function getReview(req, res) {
    const code = req.body?.code ?? req.body?.prompt ?? req.query?.code ?? req.query?.prompt;

    if (typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ error: 'Code is required' });
    }

    try {
        const prompt = `Review the following source code for correctness, security vulnerabilities, performance, and maintainability. Provide specific findings and actionable fixes. If there are no issues, say so.\n\n\`\`\`\n${code}\n\`\`\``;
        const review = await aiService.generateContent(prompt);
        return res.json({ review });
    } catch (error) {
        console.error('Error generating review:', error);
        return res.status(500).json({ error: error.message || 'Failed to generate review' });
    }
}

module.exports = { getReview };
import {
    sendMessageToClaude,
} from "../services/claude.service.js";

export const chatWithClaude = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required."
            });
        }

        const user = {
            userId: "USER-001",
            employeeId: "DGO-2001",
            role: "DGO",
        }

        const result = await sendMessageToClaude({
            message: String(message).trim(),
            user: user,
        });

        return res.status(200).json({
            success: true,
            data: {
                message: result.text,
                usage: result.usage,
                model: result.model,
            },
        });
    } catch (error) {
        console.error("Error in chatWithClaude:", error);
        res.status(500).json({ error: "Failed to generate Claude response" });
    }
};
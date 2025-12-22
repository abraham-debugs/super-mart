import express from "express";
import { SectionConfig } from "../models/SectionConfig.js";

const router = express.Router();

// Get config for a specific section
router.get("/:sectionId", async (req, res) => {
    try {
        const { sectionId } = req.params;
        const config = await SectionConfig.findOne({ sectionId });
        if (!config) {
            // Return defaults if not found, rather than 404, to simplify frontend logic
            return res.json({
                sectionId,
                title: "",
                subtitle: "",
                imageUrl: "",
                publicId: "",
                isVisible: true
            });
        }
        res.json(config);
    } catch (error) {
        console.error(`Error fetching section config for ${req.params.sectionId}:`, error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;

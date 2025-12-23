import mongoose from "mongoose";

const SectionConfigSchema = new mongoose.Schema(
    {
        sectionId: {
            type: String,
            required: true,
            unique: true
        },
        title: {
            type: String,
            default: ""
        },
        subtitle: {
            type: String,
            default: ""
        },
        imageUrl: {
            type: String, // Cloudinary URL or base64 (fallback)
            default: ""
        },
        publicId: {
            type: String, // Cloudinary public_id
            default: ""
        },
        isVisible: {
            type: Boolean,
            default: true
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

export const SectionConfig = mongoose.model("SectionConfig", SectionConfigSchema);

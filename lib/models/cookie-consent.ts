import mongoose, { Schema, models } from "mongoose"

const CookieConsentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    sessionId: {
      type: String,
      required: true,
    },
    preferences: {
      necessary: {
        type: Boolean,
        default: true, // Always true as these are required
      },
      analytics: {
        type: Boolean,
        default: false,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
      functional: {
        type: Boolean,
        default: false,
      },
    },
    consentGiven: {
      type: Boolean,
      default: false,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
CookieConsentSchema.index({ sessionId: 1 })
CookieConsentSchema.index({ userId: 1 })

export default models.CookieConsent || mongoose.model("CookieConsent", CookieConsentSchema)

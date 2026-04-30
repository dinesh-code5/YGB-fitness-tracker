const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, maxlength: 500 },
  specializations: [String], // ['Weight Loss', 'Muscle Gain', 'Nutrition']
  experience: { type: Number, default: 1 }, // years
  certifications: [String],
  profilePhoto: String,
  // Pricing
  isAcceptingClients: { type: Boolean, default: true },
  freeDays: { type: Number, default: 7 }, // free trial days before charging
  monthlyPrice: { type: Number, default: 0 }, // INR per month, 0 = free
  currency: { type: String, default: 'INR' },
  // Stats
  totalClients: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  // Social proof
  transformations: [{ // before/after images or testimonials
    clientName: String,
    description: String,
    duration: String
  }],
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Coach', coachSchema);

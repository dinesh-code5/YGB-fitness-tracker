const mongoose = require('mongoose');

const coachClientSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'active', 'trial', 'expired', 'cancelled'],
    default: 'trial'
  },
  trialStartDate: { type: Date, default: Date.now },
  trialEndDate: Date,
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  monthlyPrice: { type: Number, default: 0 },
  // Coach customizations for this client
  customWorkoutPlan: { type: mongoose.Schema.Types.Mixed }, // custom PPL or other plan
  customDietPlan: { type: mongoose.Schema.Types.Mixed },
  coachNotes: { type: String }, // private notes from coach to client
  goals: [String],
  checkIns: [{
    date: { type: Date, default: Date.now },
    weight: Number,
    note: String,
    coachFeedback: String
  }]
}, { timestamps: true });

coachClientSchema.index({ coach: 1, client: 1 }, { unique: true });

module.exports = mongoose.model('CoachClient', coachClientSchema);

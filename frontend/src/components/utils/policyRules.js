// src/utils/policyRules.js
/**
 * Central configuration for all borrowing, fine, damage, reputation, 
 * and complaint-related rules and thresholds.
 * 
 * Import this file wherever policy values are needed:
 *   import { POLICY_RULES } from '../utils/policyRules';
 * 
 * Advantages:
 * - Single place to update policy numbers
 * - No magic numbers scattered across the codebase
 * - Easy to version-control policy changes
 */

export const POLICY_RULES = {
  // ────────────────────────────────────────────────
  // General Borrowing Rules
  // ────────────────────────────────────────────────
  gracePeriodHours: 6,                    // Hours before late penalty starts

  // ────────────────────────────────────────────────
  // Late Return Fines (percentage of item value)
  // ────────────────────────────────────────────────
  lateFines: {
    1: 0.05,           // 1 day late → 5%
    '2-3': 0.10,       // 2–3 days → 10%
    '4-7': 0.20,       // 4–7 days → 20%
    '8+': 0.30,        // More than 7 days → 30%
    '14+': 1.00        // 14+ days → full value (non-return)
  },

  // Reputation impact for late returns
  lateReputationDeductions: {
    1: -3,
    '2-3': -7,
    '4-7': -15,
    '8+': -30,
    '14+': -80
  },

  // ────────────────────────────────────────────────
  // Damage Classification & Penalties
  // ────────────────────────────────────────────────
  damageLevels: {
    minor: {
      description: 'Small scratches or cosmetic wear',
      compensation: 'repair_cost_or_0.10',   // repair cost OR 10% of value
      reputationDelta: -5,
      warning: false,
      violationSeverity: 'low'
    },
    moderate: {
      description: 'Functional impact but repairable',
      compensation: 'repair_cost_or_0.40',   // repair cost OR 40%
      reputationDelta: -20,
      warning: true,
      violationSeverity: 'medium'
    },
    severe: {
      description: 'Item unusable or heavily damaged',
      compensation: '0.80_to_1.00',          // 80–100%
      reputationDelta: -50,
      warning: true,
      freezeDays: 14,
      violationSeverity: 'high'
    }
  },

  // ────────────────────────────────────────────────
  // Non-Return Rules (14+ days overdue)
  // ────────────────────────────────────────────────
  nonReturn: {
    finePercentage: 1.00,                 // 100% of item value
    reputationDelta: -80,
    suspensionDays: 60,
    blacklist: true,
    violationSeverity: 'critical'
  },

  // ────────────────────────────────────────────────
  // Repeated Violation Thresholds
  // ────────────────────────────────────────────────
  repeatedViolations: {
    minorToModerateUpgrade: 3,            // 3 minor → treated as moderate
    moderateBorrowRestriction: 2,         // 2 moderate → borrowing restricted
    severeProbationDays: 30               // 1 severe → 30-day probation
  },

  // ────────────────────────────────────────────────
  // Reputation System
  // ────────────────────────────────────────────────
  reputation: {
    onTimeReturnBonus: +2,
    consecutiveSuccessfulBonus: +5,       // every 5 successful returns
    monthlyRecoveryCap: 20,               // max reputation gain per month
    falseClaimPenalty: -40,               // false accusation (lender or borrower)
    banThreshold: 20                      // reputation below this → borrowing restricted
  },

  // ────────────────────────────────────────────────
  // Complaint Submission Deadlines (hours after event)
  // ────────────────────────────────────────────────
  complaintDeadlines: {
    damageDispute: 48,
    latePenaltyDispute: 72
  },

  // ────────────────────────────────────────────────
  // Anti-Abuse Rules (reputation penalties)
  // ────────────────────────────────────────────────
  antiAbuse: {
    falseDamageAccusation: -40,
    repeatedFalseComplaints: -70,
    repeatedFalseComplaintsThreshold: 3,  // 3 false complaints → suspension
    collusionPenalty: -100,
    permanentBanThreshold: -100
  }
};

export default POLICY_RULES;
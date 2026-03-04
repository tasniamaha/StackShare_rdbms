
import POLICY_RULES from '../utils/policyRules';

/**
 * Fine & Reputation Service
 * 
 * All calculations follow the exact rules defined in policyRules.js
 * 
 * Usage examples:
 * 
 * const lateFine = fineService.calculateLateFine(itemValue, dueDate, returnDate);
 * const damagePenalty = fineService.calculateDamagePenalty('moderate', itemValue, repairCost);
 * const restricted = fineService.shouldRestrictBorrowing(user.reputation, user.violationCount);
 */

// ────────────────────────────────────────────────
// Helper: Calculate actual days late (ignores grace period)
// ────────────────────────────────────────────────
export const getDaysLate = (dueDate, actualReturnDate = new Date()) => {
  const due = new Date(dueDate);
  const returned = new Date(actualReturnDate);
  const diffMs = returned - due;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

// ────────────────────────────────────────────────
// Late Return Fine (percentage of item value)
// ────────────────────────────────────────────────
export const calculateLateFine = (itemValue, dueDate, returnDate) => {
  const days = getDaysLate(dueDate, returnDate);
  if (days <= POLICY_RULES.gracePeriodHours / 24) return 0;

  if (days >= 14) return itemValue * POLICY_RULES.nonReturn.finePercentage;
  if (days >= 8) return itemValue * POLICY_RULES.lateFines['8+'];
  if (days >= 4) return itemValue * POLICY_RULES.lateFines['4-7'];
  if (days >= 2) return itemValue * POLICY_RULES.lateFines['2-3'];
  return itemValue * POLICY_RULES.lateFines[1];
};

export const calculateLateReputationDelta = (days) => {
  if (days >= 14) return POLICY_RULES.lateReputationDeductions['14+'];
  if (days >= 8) return POLICY_RULES.lateReputationDeductions['8+'];
  if (days >= 4) return POLICY_RULES.lateReputationDeductions['4-7'];
  if (days >= 2) return POLICY_RULES.lateReputationDeductions['2-3'];
  return POLICY_RULES.lateReputationDeductions[1];
};

// ────────────────────────────────────────────────
// Damage Penalty Calculation
// ────────────────────────────────────────────────
export const calculateDamagePenalty = (damageLevel, itemValue, repairCost = 0) => {
  const level = POLICY_RULES.damageLevels[damageLevel?.toLowerCase()];
  if (!level) {
    console.warn(`Unknown damage level: ${damageLevel}`);
    return { amount: 0, reputationDelta: 0, warning: false, freezeDays: 0 };
  }

  // Parse componetion on amount
  let amount;
  if (repairCost > 0) {
    amount = repairCost;
  } else {
    const percentage = parseFloat(level.compensation.split('_or_')[1] || 1);
    amount = itemValue * percentage;
  }

  return {
    amount: Math.round(amount), // round to whole number
    reputationDelta: level.reputationDelta,
    warning: level.warning,
    freezeDays: level.freezeDays || 0,
    violationSeverity: level.violationSeverity
  };
};

// ────────────────────────────────────────────────
// Non-Return (14+ days) — special case
// ────────────────────────────────────────────────
export const applyNonReturnPenalty = (itemValue) => {
  return {
    fine: itemValue * POLICY_RULES.nonReturn.finePercentage,
    reputationDelta: POLICY_RULES.nonReturn.reputationDelta,
    suspensionDays: POLICY_RULES.nonReturn.suspensionDays,
    blacklist: POLICY_RULES.nonReturn.blacklist,
    violationSeverity: POLICY_RULES.nonReturn.violationSeverity
  };
};

// ────────────────────────────────────────────────
// Reputation & Restriction Checks
// ────────────────────────────────────────────────
export const shouldRestrictBorrowing = (reputation, violationCount, damageLevel = null) => {
  // Reputation too low
  if (reputation < POLICY_RULES.reputation.banThreshold) {
    return { restricted: true, reason: 'Reputation too low' };
  }

  // repeted part
  if (damageLevel === 'moderate' && violationCount >= POLICY_RULES.repeatedViolations.moderateBorrowRestriction) {
    return { restricted: true, reason: 'Too many moderate violations' };
  }

  return { restricted: false };
};

// ────────────────────────────────────────────────
// Reputation Change (on-time return bonus)
// ────────────────────────────────────────────────
export const calculateOnTimeBonus = (consecutiveSuccess) => {
  let bonus = POLICY_RULES.reputation.onTimeReturnBonus;

  // Bonus for consecutive successful returns
  if (consecutiveSuccess % 5 === 0) {
    bonus += POLICY_RULES.reputation.consecutiveSuccessfulBonus;
  }

  return Math.min(bonus, POLICY_RULES.reputation.monthlyRecoveryCap);
};

// ────────────────────────────────────────────────
// Anti-Abuse Penalties
// ────────────────────────────────────────────────
export const getFalseClaimPenalty = () => POLICY_RULES.antiAbuse.falseDamageAccusation;

export const getRepeatedFalseComplaintPenalty = (falseComplaintCount) => {
  if (falseComplaintCount >= POLICY_RULES.antiAbuse.repeatedFalseComplaintsThreshold) {
    return POLICY_RULES.antiAbuse.repeatedFalseComplaints;
  }
  return 0;
};

export default {
  getDaysLate,
  calculateLateFine,
  calculateLateReputationDelta,
  calculateDamagePenalty,
  applyNonReturnPenalty,
  shouldRestrictBorrowing,
  calculateOnTimeBonus,
  getFalseClaimPenalty,
  getRepeatedFalseComplaintPenalty

};




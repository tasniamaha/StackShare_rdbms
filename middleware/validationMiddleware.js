// middleware/validationMiddleware.js
const { body, validationResult } = require('express-validator');

// Handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Registration validation
exports.validateRegister = [
  body('student_id').notEmpty().withMessage('Student ID is required'),
  body('student_name').notEmpty().withMessage('Name is required'),
  body('student_email').isEmail().withMessage('Valid email is required'),
  body('student_dept').notEmpty().withMessage('Department is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

// Login validation
exports.validateLogin = [
  body('student_email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Device validation
exports.validateDevice = [
  body('device_name').notEmpty().withMessage('Device name is required'),
  body('device_category').notEmpty().withMessage('Category is required'),
  validate
];

// Borrow request validation
exports.validateBorrowRequest = [
  body('device_id').isInt().withMessage('Valid device ID is required'),
  validate
];

// Fine validation
exports.validateFine = [
  body('borrow_id').isInt().withMessage('Valid borrow ID is required'),
  body('student_id').notEmpty().withMessage('Student ID is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('fine_amount').isFloat({ min: 0 }).withMessage('Valid fine amount is required'),
  body('due_date').isDate().withMessage('Valid due date is required'),
  validate
];

// Broadcast validation
exports.validateBroadcast = [
  body('item_type').notEmpty().withMessage('Item type is required'),
  body('urgency_level').isIn(['Low', 'Medium', 'High']).withMessage('Invalid urgency level'),
  validate
];

// Damage report validation
exports.validateDamageReport = [
  body('borrow_id').isInt().withMessage('Valid borrow ID is required'),
  body('device_id').isInt().withMessage('Valid device ID is required'),
  body('accused_student').notEmpty().withMessage('Accused student is required'),
  body('damage_description').notEmpty().withMessage('Description is required'),
  validate
];
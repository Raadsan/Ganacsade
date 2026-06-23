import { validationResult } from 'express-validator';

/**
 * Middleware to validate request using express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const errorMessages = errorArray.map(err => `${err.path || err.param}: ${err.msg}`).join(', ');
    
    return res.status(400).json({
      success: false,
      message: `Validation failed: ${errorMessages}`,
      errors: errorArray.map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  next();
};

export default validate;

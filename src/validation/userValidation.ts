import { Joi, celebrate, Segments } from 'celebrate';

export const createUserValidation = celebrate({
  [Segments.BODY]: Joi.object().keys({
    username: Joi.string().required().messages({
      'string.empty': 'Username is required.',
      'any.required': 'Username is required.'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is required.'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    }),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'EMPLOYEE').required().messages({
      'string.valid': 'Role must be one of ADMIN, MANAGER, or EMPLOYEE.',
      'string.empty': 'Role is required.',
      'any.required': 'Role is required.'
    }),
  }),
});

export const updateUserValidation = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().uuid().required().messages({
      'string.uuid': 'User ID must be a valid UUID.',
      'string.empty': 'User ID is required.',
      'any.required': 'User ID is required.'
    }),
  }),
  [Segments.BODY]: Joi.object().keys({
    username: Joi.string().messages({
      'string.empty': 'Username cannot be empty.',
    }),
    email: Joi.string().email().messages({
      'string.email': 'Invalid email format.',
    }),
    password: Joi.string().min(6).messages({
      'string.min': 'Password must be at least 6 characters long.',
    }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update.',
  }),
});

export const getUserByIdValidation = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().uuid().required().messages({
      'string.uuid': 'User ID must be a valid UUID.',
      'string.empty': 'User ID is required.',
      'any.required': 'User ID is required.'
    }),
  }),
});

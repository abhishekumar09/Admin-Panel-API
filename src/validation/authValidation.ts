import { Joi, celebrate, Segments } from 'celebrate';

export const loginValidation = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is required.'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    }),
  }),
});

export const signupValidation = celebrate({
  [Segments.BODY]: Joi.object().keys({
    username: Joi.string().required().messages({
      'string.empty': 'Username is required.',
      'any.required': 'Username is required.'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is required.'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    }),
  }),
});

export const registerUserValidation = celebrate({
  [Segments.BODY]: Joi.object().keys({
    username: Joi.string().required().messages({
      'string.empty': 'Username is required.',
      'any.required': 'Username is required.'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is required.'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    }),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'EMPLOYEE').required().messages({
      'string.valid': 'Role must be one of the following: ADMIN, MANAGER, EMPLOYEE.',
      'string.empty': 'Role is required.',
      'any.required': 'Role is required.'
    }),
  }),
});

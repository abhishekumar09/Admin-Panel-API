import { Joi, celebrate, Segments } from 'celebrate';

export const createProjectValidation = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().required().messages({
      'string.empty': 'Project name is required.',
      'any.required': 'Project name is required.'
    }),
    description: Joi.string().required().messages({
      'string.empty': 'Project description is required.',
      'any.required': 'Project description is required.'
    }),
    assignedTo: Joi.array().items(Joi.string().uuid()).optional().messages({
      'array.items': 'Each assigned user ID must be a valid UUID.',
      'array.base': 'Assigned users must be an array.',
    }),
  }),
});

export const updateProjectValidation = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().uuid().required().messages({
      'string.uuid': 'Project ID must be a valid UUID.',
      'string.empty': 'Project ID is required.',
      'any.required': 'Project ID is required.'
    }),
  }),
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().optional().messages({
      'string.empty': 'Project name cannot be empty.',
    }),
    description: Joi.string().optional().messages({
      'string.empty': 'Project description cannot be empty.',
    }),
    assignedTo: Joi.array().items(Joi.string().uuid()).optional().messages({
      'array.items': 'Each assigned user ID must be a valid UUID.',
      'array.base': 'Assigned users must be an array.',
    }),
    unassignedTo: Joi.array().items(Joi.string().uuid()).optional().messages({
      'array.items': 'Each unassigned user ID must be a valid UUID.',
      'array.base': 'Unassigned users must be an array.',
    }),
  }).min(1).messages({
    'object.min': 'At least one field must be updated.',
  }),
});

export const getProjectByIdValidation = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().uuid().required().messages({
      'string.uuid': 'Project ID must be a valid UUID.',
      'string.empty': 'Project ID is required.',
      'any.required': 'Project ID is required.'
    }),
  }),
});

import Joi from "joi";

export const validateRegisterUser = (body) => {
  const schema = Joi.object({
    profileFor: Joi.string().required(),
    fullName: Joi.string().trim().required(),
    mobile: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),
    dob: Joi.date().iso().required(),
    religion: Joi.string().trim().required(),
    motherTongue: Joi.string().trim().required(),
    gender: Joi.string().valid().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    caste: Joi.string().required(),
    subcaste: Joi.string().allow(""), // optional
    gothram: Joi.string().allow(""), // optional
    dosh: Joi.string().allow(""), // optional
    role: Joi.string().valid("user", "admin").default("user"), // optional with default
  });

  const { error } = schema.validate(body);
  if (error) {
    return { valid: false, message: error.details[0].message };
  }

  return { valid: true };
};

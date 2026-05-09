// server/middleware/validate.js
// Zod request validation middleware factory
// Usage: router.post('/route', validate(MySchema), handler)
import { ZodError } from "zod";

/**
 * Returns Express middleware that validates req.body against a Zod schema.
 * On failure: 422 with field-level error details.
 * On success: calls next() with validated (parsed) body re-attached to req.
 */
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(422).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }
    next(err);
  }
};

/**
 * Same but for query params (req.query).
 */
export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(422).json({
        success: false,
        message: "Invalid query parameters.",
        errors,
      });
    }
    next(err);
  }
};

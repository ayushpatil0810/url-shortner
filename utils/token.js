import jwt from "jsonwebtoken";
import { userTokenSchema } from "../validations/token.validation.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function creatUserToken(payload) {
  const validationResult = await userTokenSchema.safeParseAsync(payload);

  if (validationResult.error) throw new Error(validationResult.error.message);

  const payloadValidatedData = validationResult.data;

  const token = jwt.sign(payload, JWT_SECRET);

  return token;
}

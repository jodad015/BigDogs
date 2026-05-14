import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignInFormData = z.infer<typeof signInSchema>;

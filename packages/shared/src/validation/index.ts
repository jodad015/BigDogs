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

export const displayNameSchema = z.string().min(1, 'Display name is required').max(50);

export const signUpSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const challengeNameSchema = z.string().min(1, 'Challenge name is required').max(100);

export const durationWeeksSchema = z
  .number()
  .refine((v) => [10, 12, 14, 16].includes(v), 'Duration must be 10, 12, 14, or 16 weeks');

export const inviteCodeSchema = z
  .string()
  .min(1, 'Invite code is required')
  .transform((v) => v.toUpperCase().trim());

import { z } from 'zod';
import {
  AGGREGATIONS,
  DIRECTIONS,
  ENTRANT_TYPES,
  METRIC_TYPES,
  TIME_WINDOWS,
} from '../leaderboard/config';

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

export const orgNameSchema = z.string().trim().min(1, 'Name is required').max(80);

export const orgSlugSchema = z
  .string()
  .trim()
  .min(1, 'URL name is required')
  .max(40)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes');

export const playerNameSchema = z.string().trim().min(1, 'Name is required').max(50);

export const inviteCodeSchema = z
  .string()
  .min(1, 'Invite code is required')
  .transform((v) => v.toUpperCase().trim());

export const leaderboardSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(80),
    description: z.string().trim().max(500).nullable(),
    icon: z.string().min(1).max(16),
    metric_type: z.enum(METRIC_TYPES),
    unit: z.string().trim().min(1, 'Unit is required').max(20),
    decimals: z.number().int().min(0).max(3),
    default_attempts: z.number().int().positive().nullable(),
    direction: z.enum(DIRECTIONS),
    aggregation: z.enum(AGGREGATIONS),
    default_window: z.enum(TIME_WINDOWS),
    entrant_type: z.enum(ENTRANT_TYPES),
    team_size: z.number().int().min(2).max(10).nullable(),
  })
  .superRefine((lb, ctx) => {
    if (lb.entrant_type === 'team' && lb.team_size === null) {
      ctx.addIssue({ code: 'custom', path: ['team_size'], message: 'Pick a team size' });
    }
    if (lb.metric_type === 'made_of_attempts' && lb.direction !== 'higher_better') {
      ctx.addIssue({
        code: 'custom',
        path: ['direction'],
        message: 'X of Y boards rank higher is better',
      });
    }
  })
  .transform((lb) => ({
    ...lb,
    team_size: lb.entrant_type === 'team' ? lb.team_size : null,
    default_attempts: lb.metric_type === 'made_of_attempts' ? lb.default_attempts : null,
  }));

export type LeaderboardFormData = z.input<typeof leaderboardSchema>;

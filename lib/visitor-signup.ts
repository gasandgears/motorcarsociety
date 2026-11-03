import { z } from "zod";
export const visitorSignupInput = z.object({
  name: z.string().trim().min(2).max(120).regex(/^[^\r\n\x00-\x1f]+$/),
  email: z.string().trim().email().max(180).transform(value => value.toLowerCase()),
  phone: z.string().trim().max(50).regex(/^[+\d\s().-]*$/).default(""),
  consent: z.literal(true),
  website: z.string().max(200).optional(),
  startedAt: z.number(),
});

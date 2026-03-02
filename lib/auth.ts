import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      premium: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
    },
  },
  plugins: [nextCookies()],
});

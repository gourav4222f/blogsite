import { DefaultSession } from "next-auth";

// Module augmentation for NextAuth to include `id` on Session's user
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Module augmentation for NextAuth JWT to include `id`
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export {};

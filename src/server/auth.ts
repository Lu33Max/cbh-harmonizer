import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";

import DiscordProvider from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { SHA256 } from "crypto-js";
import { loginSchema } from "~/common/validation/auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // role: UserRole;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
    jwt: ({ token, user }) => ({
      ...token,
      user,
    }),
  },
  adapter: PrismaAdapter(prisma),
  secret: "amzaingSECRET",
  jwt: {
    maxAge: 15 * 24 * 60 * 60,
  },
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "example@email.com",
        },
        password: {
          label: "Password",
          type: "password"
        },
      },
      authorize: async (credentials) => {
        const creds = await loginSchema.parseAsync(credentials)

        const user = await prisma.user.findUnique({
          where: {
            email: creds.email
          }
        })
        
        if(user && user.password === SHA256(creds.password).toString()){
          return user
        } else {
          return null
        }
      },
    })
  ],
  pages:  {
    signIn: "/auth/login",
    newUser: "/auth/signup",
  },
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

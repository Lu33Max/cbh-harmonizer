import { TRPCError } from "@trpc/server";
import { SHA256 } from "crypto-js";
import { signUpSchema } from "~/common/validation/auth";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
    signup: publicProcedure
        .input(signUpSchema)
        .mutation(async ({ ctx, input }) => {

            const exists = await ctx.prisma.user.findUnique({
                where: {
                    email: input.username,
                }
            })

            if(exists){
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "User already exists"
                })
            }

            return ctx.prisma.user.create({
                data: {
                    name: input.username,
                    email: input.email,
                    password: hashPassword(input.password)
                }
            })
        })
})

const hashPassword = (password: string) => {
    return SHA256(password).toString();
}
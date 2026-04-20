import z from 'zod'

export const signupSchema = z.object({
    username: z.string(),
    password: z.string()
}) 

export const siginSchema = z.object({
    username: z.string(),
    password: z.string()
})

export const websiteSchema = z.object({
    url: z.string().url("Invalid URL"),
});
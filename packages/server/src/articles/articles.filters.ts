import { z } from 'zod'

export const ArticleFiltersDTO = z
  .object({
    tags: z
      .union([z.array(z.string()), z.string().transform(tags => tags?.split(','))])
      .describe('The article tags. Example: ["dragons", "training"]')
      .optional(),
    author: z.string().optional().describe('The article author username'),
    favorited: z.coerce.boolean().optional().describe('Whether the article is favorited by you'),
  })
  .transform(o => {
    return {
      ...o,
      toParams: () => ({
        ...(o.tags ? { tags: o.tags.join(',') } : {}),
        ...(o.author ? { author: o.author } : {}),
        ...(o.favorited ? { favorited: o.favorited.toString() } : {}),
      }),
    }
  })
export type ArticleFiltersDTO = z.infer<typeof ArticleFiltersDTO>

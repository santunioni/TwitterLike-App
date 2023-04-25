import { z } from 'zod'

export class Pagination {
  constructor(public skip: number, public take: number) {}

  getNextPage() {
    return new Pagination(this.skip + this.take, this.take)
  }

  getPreviousPage() {
    return new Pagination(Math.max(this.skip - this.take, 0), this.take)
  }

  updateQuery(urlSearchParams: URLSearchParams) {
    urlSearchParams.set('skip', this.skip.toString())
    urlSearchParams.set('take', this.take.toString())
    return urlSearchParams
  }

  toParams() {
    return {
      skip: this.skip.toString(),
      take: this.take.toString(),
    }
  }
}

export const ZodPagination = z
  .object({
    skip: z.coerce.number().min(0).default(0),
    take: z.coerce.number().min(0).max(20).default(10),
  })
  .default({
    skip: 0,
    take: 10,
  })
  .transform(({ skip, take }) => new Pagination(skip, take))

import { z } from 'zod'

export class Pagination {
  constructor(public skip: number, public take: number) {}

  getNextPage() {
    return new Pagination(this.skip + this.take, this.take)
  }

  getPreviousPage() {
    return new Pagination(Math.max(this.skip - this.take, 0), this.take)
  }

  toParams() {
    return { skip: this.skip, take: this.take }
  }

  toQueryString() {
    return `skip=${this.skip}&take=${this.take}`
  }
}

export const ZodPagination = z
  .object({
    skip: z.coerce.number().min(0).default(0),
    take: z.coerce.number().min(0).max(200).default(20),
  })
  .default({
    skip: 0,
    take: 20,
  })
  .transform(({ skip, take }) => new Pagination(skip, take))

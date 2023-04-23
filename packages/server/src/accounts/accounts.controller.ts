import { Controller, HttpCode, HttpStatus, Injectable, Post, Req, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBasicAuth, ApiBody, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { ZodBody } from '../nest/validation.utils'
import { InvalidCredentialsError } from './accounts.exceptions'
import { UsersService } from './accounts.service'

const CreateUserDTO = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(32).regex(/[A-Z]/).regex(/[a-z]/).regex(/\d/).regex(/\W/),
})

export type CreateUserDTO = z.infer<typeof CreateUserDTO>

const CreateUserBody = z.object({
  user: CreateUserDTO,
})

type CreateUserBody = z.infer<typeof CreateUserBody>

@Injectable()
export class BasicAuthGuard extends AuthGuard('basic') {}

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private service: UsersService) {}

  @ApiBody({
    schema: zodToJsonSchema(CreateUserBody) as any,
  })
  @Post('signup')
  async signup(
    @ZodBody(CreateUserBody)
    body: CreateUserBody,
  ) {
    const user = await this.service.createUserAccount(body.user)
    return this.service.getJWTResponse(user)
  }

  /**
   * Route protected by Basic Auth and return a JWT to be used in the Authorization header
   * @param req
   */
  @ApiBasicAuth()
  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  async login(@Req() req: { headers?: { authorization?: string } }) {
    try {
      const [authMethod, basicAuthToken] = req.headers?.authorization?.split(' ') || []
      if (authMethod?.toLowerCase() !== 'basic' || !basicAuthToken) {
        throw new UnauthorizedException()
      }
      const [email, password] = Buffer.from(basicAuthToken, 'base64').toString().split(':')

      const user = await this.service.getUserAccount({
        email,
        password,
      })

      return this.service.getJWTResponse(user)
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException()
      }
      throw error
    }
  }
}

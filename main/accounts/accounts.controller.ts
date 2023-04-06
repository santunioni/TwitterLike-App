import {
  Body,
  Controller,
  Injectable,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger'
import { UsersService } from './accounts.service'
import { z } from 'zod'
import { createZodTransformer } from '../nest/validation.utils'
import { AuthGuard } from '@nestjs/passport'

const CreateUserDTO = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(32)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/)
    .regex(/\W/),
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

  @Post('signup')
  async signup(
    @Body(createZodTransformer(CreateUserBody))
    body: CreateUserBody,
  ) {
    const user = await this.service.createUserAccount(body.user)
    return this.service.getJWTResponse(user)
  }

  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @Post('login')
  login(@Req() req) {
    return this.service.getJWTResponse(req.user)
  }
}

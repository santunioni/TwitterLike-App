import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common'
import {
  AuthGuard,
  PassportStrategy as NestGuardStrategyFor,
} from '@nestjs/passport'
import { AUDIENCE, TOKEN_PRIVATE_KEY } from '../global/constants'
import * as jwt from 'jsonwebtoken'
import { Reflector } from '@nestjs/core'
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt'

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context)
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    // console.log('Calling handleRequest from JWTAuthGuard')
    const userIsOptional = this.reflector.get<boolean | null>(
      authIsOptionalString,
      context.getHandler(),
    )
    if (!user && userIsOptional) {
      return null
    }
    return super.handleRequest(err, user, info, context)
  }
}

const authIsOptionalString = 'authIsOptional'
export const AuthIsOptional = () => SetMetadata(authIsOptionalString, true)

@Injectable()
export class JWTAuthPassport extends NestGuardStrategyFor(JWTStrategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: AUDIENCE,
      secretOrKey: TOKEN_PRIVATE_KEY,
    })
  }

  async validate(payload: any): Promise<User> {
    return { id: parseInt(payload.sub), email: payload.email }
  }
}

export interface User {
  id: number
  email?: string
}

export function getUserFromHeaders(
  headers: Record<string, string>,
  required: boolean = true,
): User | null {
  const authorization: string = headers.authorization

  if (!authorization) {
    if (required) {
      throw new UnauthorizedException()
    } else {
      return null
    }
  }

  const token = authorization.split(' ')[1]
  const result = jwt.verify(token, TOKEN_PRIVATE_KEY, {
    audience: AUDIENCE,
    complete: true,
  })

  return {
    id: parseInt(result.payload.sub as string),
    email: (result.payload as Record<string, string>).email,
  } as User
}

export function GetUser(opts = { required: true }) {
  return createParamDecorator((data: unknown, ctx: ExecutionContext) =>
    getUserFromHeaders(ctx.switchToHttp().getRequest().headers, opts.required),
  )()
}

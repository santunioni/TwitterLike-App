import { Module } from '@nestjs/common'
import { AccountsController } from './accounts.controller'
import { UsersService } from './accounts.service'

@Module({
  providers: [UsersService],
  controllers: [AccountsController],
})
export class AccountsModule {}

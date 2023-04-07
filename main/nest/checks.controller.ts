import { Controller, Get, Req, Res } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import axios from 'axios'
import { Request, Response } from 'express'
import { buildUrlToPath } from './url'

@ApiTags('checks')
@Controller('checks')
export class ChecksController {
  @Get('readiness')
  async healthCheck(@Req() req: Request, @Res() res: Response) {
    const articles = await axios.get(buildUrlToPath(req, 'articles'))
    res.status(articles.status).send(articles.status === 200)
  }
}

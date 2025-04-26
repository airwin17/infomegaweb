import { Controller, Get, Headers, Render, Res } from '@nestjs/common';
import { AppService } from '../app.service';
import { Response } from 'express';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/fr/')
  @Render('index')
  getIndexFr(){;
  }
  @Get('/en/')
  @Render('index-en')
  getIndexEn(): null {
    return null;
  }
  @Get()
  redirectTogetIndex(@Headers("host") host: string, @Res() res: Response) {
    if (host === "ecrivainpublicmarseille.com") {
      return res.redirect("http://localhost:8079")
    } else {
      return res.redirect("/fr/")
    }
  }
}

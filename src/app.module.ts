import { DemoController } from './controllers/demo.controller';
import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './app.service';
@Module({
  controllers: [
    DemoController, AppController],
  providers: [AppService],
})
export class AppModule { }

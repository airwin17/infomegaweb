import { DemoController } from './controllers/demo.controller';
import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './app.service';
import { ClientsModule,Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    HttpModule,
    ClientsModule.register([
      {
        name: 'PCLINK',
        transport: Transport.TCP,
        options: {
          port: 8080,
          host: 'localhost',
        },
      },
    ]),
  ],
  controllers: [
    DemoController, AppController],
  providers: [AppService],
})
export class AppModule { }

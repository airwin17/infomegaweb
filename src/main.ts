import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setViewEngine('hbs');
  app.setBaseViewsDir('./views');
  app.engine('hbs', hbs.__express.bind(hbs));
  app.useStaticAssets('./public');
  app.useStaticAssets('./dist/public');
  hbs.registerPartials('./views/partials');
  hbs.registerHelper('split', function (str: unknown) {
    if (typeof str === 'string') {
      return str.split(';');
    }
    return [];
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

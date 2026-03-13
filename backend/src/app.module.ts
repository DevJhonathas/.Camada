import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ExampleService } from './app.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [ExampleService],
})
export class AppModule {}

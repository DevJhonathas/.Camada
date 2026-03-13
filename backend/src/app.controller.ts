import { Controller, Get } from '@nestjs/common';
import { ExampleService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  getExemple() {
    return this.exampleService.getExemple();
  }
}

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleService {
  constructor(private readonly httpService: HttpService) {}

  async getExemple() {
    const curl: string =
      'https://brapi.dev/api/quote/PETR4,VALE3,MGLU3?fundamental=true&dividends=true&?range=1mo&interval=1d';
    const response = await this.httpService.axiosRef.get(curl);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data;
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
      return {
    success: true,
    message: 'Welcome to Nuvora E-commerce API',
    version: '1.0.0',
    status: 'Server is up and running',
  };
  }
}

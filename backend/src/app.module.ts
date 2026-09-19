import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InsuranceModule } from './insurance/insurance.module';

@Module({
  imports: [InsuranceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

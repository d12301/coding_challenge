import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { IsNumber, IsBoolean, Min, Max, IsString, IsOptional } from 'class-validator';

export class QuoteDto {
  @IsNumber()
  @Min(18)
  @Max(100)
  age: number;

  @IsBoolean()
  hasPreExistingConditions: boolean;
}

export class CheckoutDto {
  @IsString()
  @IsOptional()
  paymentToken?: string;
}

export class MedicalDeclarationDto {
  @IsString()
  quoteId: string;

  @IsBoolean()
  hasDiabetes: boolean;

  @IsBoolean()
  hasHeartCondition: boolean;
}

@Controller('api/v1/insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post('quote')
  @HttpCode(200)
  async generateQuote(@Body() body: QuoteDto) {
    return this.insuranceService.generateQuote(body.age, body.hasPreExistingConditions);
  }

  @Post('medical-declaration')
  @HttpCode(200)
  async submitMedicalDeclaration(@Body() body: MedicalDeclarationDto) {
    return this.insuranceService.submitMedicalDeclaration(
      body.quoteId,
      body.hasDiabetes,
      body.hasHeartCondition,
    );
  }

  @Post('checkout')
  @HttpCode(200)
  async checkout(
    @Body() body: CheckoutDto,
    @Headers('idempotency_key') idempotencyKey: string,
    @Headers('quote_id') quoteIdHeader?: string, 
  ) {
    
    const qId = (body as any).quoteId || quoteIdHeader;
    return this.insuranceService.checkout(qId, idempotencyKey);
  }
}

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InsuranceService {
  constructor(private prisma: PrismaService) {}

  async generateQuote(age: number, hasPreExistingConditions: boolean) {
    let basePremium = 10000;
    if (age > 45) {
      basePremium += 10000 * 0.5;
    }
    if (hasPreExistingConditions) {
      basePremium += 5000;
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const quote = await this.prisma.quote.create({
      data: {
        age,
        hasPreExistingConditions,
        premium: basePremium,
        status: 'QUOTE_GENERATED',
        expires_at: expiresAt,
      },
    });

    return {
      quoteId: quote.id,
      premium: Number(quote.premium),
      expires_at: quote.expires_at,
    };
  }

  async submitMedicalDeclaration(quoteId: string, hasDiabetes: boolean, hasHeartCondition: boolean) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      throw new HttpException('Quote not found', HttpStatus.NOT_FOUND);
    }

    if (quote.status !== 'QUOTE_GENERATED') {
      throw new HttpException('Quote is not in a valid state for medical declaration', HttpStatus.BAD_REQUEST);
    }

    if (new Date() > quote.expires_at) {
      throw new HttpException('Quote has expired', HttpStatus.BAD_REQUEST);
    }

    
    const updatedQuote = await this.prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'MEDICAL_DECLARED' },
    });

    return {
      success: true,
      quoteId: updatedQuote.id,
      status: updatedQuote.status,
    };
  }

  async checkout(quoteId: string, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new HttpException('Idempotency key is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        await tx.idempotencyKey.create({
          data: { key: idempotencyKey }
        });

        const quote = await tx.quote.findUnique({
          where: { id: quoteId },
        });

        if (!quote) {
          throw new HttpException('Quote not found', HttpStatus.NOT_FOUND);
        }

        if (quote.status !== 'MEDICAL_DECLARED') {
          throw new HttpException('Quote is not in a valid state for checkout. Medical declaration required.', HttpStatus.BAD_REQUEST);
        }

        if (new Date() > quote.expires_at) {
          throw new HttpException('Quote has expired', HttpStatus.BAD_REQUEST);
        }

        await tx.quote.update({
          where: { id: quoteId },
          data: { status: 'PREMIUM_PAID' },
        });

        const updatedQuote = await tx.quote.update({
          where: { id: quoteId },
          data: { status: 'POLICY_ISSUED' },
        });
        
        const policy = await tx.policy.create({
          data: {
            quoteId: quote.id,
          },
        });

        return { policy, updatedQuote };
      });

      return {
        success: true,
        policyId: result.policy.id,
        message: 'Payment successful. Policy issued.',
      };
    } catch (error) {
      // Prisma P2002 means Unique constraint failed
      if (error?.code === 'P2002') {
        return { message: 'Payment already processed for this idempotency key.' };
      }
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error during checkout', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

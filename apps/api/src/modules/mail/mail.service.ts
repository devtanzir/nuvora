import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, name: string, token: string, clientUrl: string) {
    const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your email — Nuvora',
      template: 'verify-email',
      context: {
        name,
        verificationUrl,
      },
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string, clientUrl: string) {
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password - Nuvora',
      template: 'reset-password',
      context: {
        name,
        resetUrl,
      },
    });
  }
}

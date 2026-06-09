import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
    clientUrl: string,
  ) {
    const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify your email - Nuvora',
        template: 'verify-email',
        context: {
          name,
          verificationUrl,
        },
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send verification email to ${email}: ${message}`,
      );
    }
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
    clientUrl: string,
  ) {
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset your password - Nuvora',
        template: 'reset-password',
        context: {
          name,
          resetUrl,
        },
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error: unknown) {
       const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send password reset email to ${email}: ${message}`,
      );
    }
  }

  async sendOrderStatusEmail(
    email: string,
    name: string,
    orderId: string,
    newStatus: string,
    trackingNumber?: string,
  ) {
    const subject = `Your order ${orderId} is now ${newStatus}`;
    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        template: 'order-status',
        context: { name, orderId, status: newStatus, trackingNumber },
      });
      this.logger.log(`Order status email sent to ${email} for order ${orderId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send order status email to ${email}: ${message}`,
      );
    }
  }

async sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  items: { productName: string; quantity: number; price: string }[],
  total: number, // still in cents
) {
  try {
    await this.mailerService.sendMail({
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      template: 'order-confirmation',
      context: {
        name,
        orderNumber,
        items,
        total: (total / 100).toFixed(2),
      },
    });
    this.logger.log(`Order confirmation email sent to ${email}`);
  } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
    this.logger.error(`Failed to send order confirmation email: ${message}`);
  }
}
}

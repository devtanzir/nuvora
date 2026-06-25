import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow('BREVO_API_KEY');
  }

  private async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ) {
    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: 'Nuvora',
            email: 'nuvora.ecomerce@gmail.com', // verified sender in Brevo
          },
          to: [{ email: to }],
          subject,
          htmlContent,
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.response?.data?.message ?? error.message}`);
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string, clientUrl: string) {
    const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
    const html = `
      <h2>Hi ${name},</h2>
      <p>Thanks for registering at Nuvora. Please verify your email by clicking the button below.</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1B2D4F; color: #fff; text-decoration: none; border-radius: 6px;">Verify Email</a>
      <p style="margin-top: 16px; color: #666;">This link will expire in 24 hours.</p>
    `;
    await this.sendEmail(email, 'Verify your email - Nuvora', html);
  }

  async sendPasswordResetEmail(email: string, name: string, token: string, clientUrl: string) {
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;
    const html = `
      <h2>Hi ${name},</h2>
      <p>We received a request to reset your password. Click the button below to reset it.</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1B2D4F; color: #fff; text-decoration: none; border-radius: 6px;">Reset Password</a>
      <p style="margin-top: 16px; color: #666;">This link will expire in 1 hour.</p>
    `;
    await this.sendEmail(email, 'Reset your password - Nuvora', html);
  }

  async sendOrderConfirmationEmail(
    email: string,
    name: string,
    orderNumber: string,
    items: { productName: string; quantity: number; price: string }[],
    total: number,
  ) {
    const itemsHtml = items
      .map(
        (item) => `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>$${item.price}</td></tr>`,
      )
      .join('');
    const html = `
      <h2>Hi ${name},</h2>
      <p>Thank you for your order! Your order <strong>${orderNumber}</strong> has been placed.</p>
      <table style="width:100%; border-collapse:collapse;">
        <tr style="background:#f0f0f0;"><th>Item</th><th>Qty</th><th>Price</th></tr>
        ${itemsHtml}
      </table>
      <p style="text-align:right; font-weight:bold;">Total: $${(total / 100).toFixed(2)}</p>
    `;
    await this.sendEmail(email, `Order Confirmation - ${orderNumber}`, html);
  }

  async sendOrderStatusEmail(
    email: string,
    name: string,
    orderId: string,
    newStatus: string,
    trackingNumber?: string,
  ) {
    const tracking = trackingNumber ? `<p>Tracking number: ${trackingNumber}</p>` : '';
    const html = `
      <h2>Hi ${name},</h2>
      <p>Your order <strong>${orderId}</strong> status has been updated to <strong>${newStatus}</strong>.</p>
      ${tracking}
    `;
    await this.sendEmail(email, `Your order ${orderId} is now ${newStatus}`, html);
  }
}

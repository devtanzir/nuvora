import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // ============================================================
  // Helper - Token Generate
  // ============================================================

  private generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    return { accessToken, refreshToken };
  }

  // ============================================================
  // Register
  // ============================================================

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    // Email verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    await this.mailService.sendVerificationEmail(
      user.email,
      user.name,
      token,
      this.configService.get('CLIENT_URL')!,
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  // ============================================================
  // Verify Email
  // ============================================================

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });

    await this.prisma.emailVerificationToken.delete({
      where: { token },
    });

    return { message: 'Email verified successfully' };
  }

  // ============================================================
  // Login
  // ============================================================

  async login(dto: LoginDto, res: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException('Please verify your email first');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Your account has been deactivated');
    }

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.role,
    );

    // Refresh token will save in Database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    // httpOnly cookie will be set
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  // ============================================================
  // Refresh Token
  // ============================================================

  async refresh(refreshToken: string, res: any) {
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const hashedToken = this.hashToken(refreshToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: hashedToken },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { token: hashedToken } });

    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(
      user.id,
      user.role,
    );
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: this.hashToken(newRefreshToken),
        expiresAt,
      },
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  // ============================================================
  // Logout
  // ============================================================

  async logout(refreshToken: string, res: any) {
    if (refreshToken) {
      const hashed = this.hashToken(refreshToken);
      await this.prisma.refreshToken.deleteMany({
        where: { token: hashed },
      });
    }
    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }

  // ============================================================
  // Forgot Password
  // ============================================================

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Security: Even if user not found, we return success message to prevent email enumeration
    if (!user) {
      return { message: 'Password reset link sent to your email' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.name,
      token,
      this.configService.get('CLIENT_URL')!,
    );

    return { message: 'Password reset link sent to your email' };
  }

  // ============================================================
  // Reset Password
  // ============================================================

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
    });

    if (!record) throw new BadRequestException('Invalid or expired token');
    if (record.used) throw new BadRequestException('Token already used');
    if (record.expiresAt < new Date())
      throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword },
    });

    await this.prisma.refreshToken.deleteMany({
      where: { userId: record.userId },
    });

    await this.prisma.passwordResetToken.update({
      where: { token: dto.token },
      data: { used: true },
    });

    return { message: 'Password reset successful' };
  }

  // ============================================================
  // Get Me
  // ============================================================

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ============================================================
  // Google OAuth
  // ============================================================

async googleLogin(googleUser: any, res: any) {
  let user = await this.prisma.user.findUnique({
    where: { email: googleUser.email },
  });

  if (!user) {
    user = await this.prisma.user.create({
      data: {
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.avatar,
        googleId: googleUser.googleId,
        emailVerified: true,
      },
    });
  } else if (!user.googleId) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { googleId: googleUser.googleId },
    });
  }

  const { accessToken, refreshToken } = this.generateTokens(user.id, user.role);

  // Save hashed refresh token in DB
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await this.prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: this.hashToken(refreshToken),
      expiresAt,
    },
  });

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: this.configService.get('NODE_ENV') === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Generate single-use code for access token exchange
  const oauthCode = crypto.randomBytes(32).toString('hex');
  const codeExpiresAt = new Date(Date.now() + 60 * 1000); // 1 minute

  await this.prisma.oAuthCode.create({
    data: {
      code: oauthCode,
      accessToken,
      expiresAt: codeExpiresAt,
    },
  });

  // Redirect to frontend with only the code
  res.redirect(
    `${this.configService.get('CLIENT_URL')}/auth/callback?code=${oauthCode}`,
  );
}
async exchangeOAuthCode(code: string) {
  const record = await this.prisma.oAuthCode.findUnique({
    where: { code },
  });

  if (!record || record.used || record.expiresAt < new Date()) {
    throw new BadRequestException('Invalid or expired code');
  }

  // Mark as used (or delete)
  await this.prisma.oAuthCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  return { accessToken: record.accessToken };
}
}

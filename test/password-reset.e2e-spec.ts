import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Password Reset (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    // Clean up test data
    await prismaService.db.auth.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });
    await app.close();
  });

  describe('/auth/forgot-password (POST)', () => {
    it('should request password reset for existing email', async () => {
      // First, create a test auth
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          name: 'Test User',
          phone: '1234567890',
        })
        .expect(201);

      // Request password reset
      const response: { body: { message: string; resetToken: string } } =
        await request(app.getHttpServer())
          .post('/auth/forgot-password')
          .send({
            email: 'test@example.com',
          })
          .expect(201);

      expect(response.body.message).toBe(
        'If the email exists, a reset link has been sent.',
      );
      expect(response.body.resetToken).toBeDefined();
    });

    it('should not reveal if email does not exist', async () => {
      const response: { body: { message: string; resetToken?: string } } =
        await request(app.getHttpServer())
          .post('/auth/forgot-password')
          .send({
            email: 'nonexistent@example.com',
          })
          .expect(201);

      expect(response.body.message).toBe(
        'If the email exists, a reset link has been sent.',
      );
      expect(response.body.resetToken).toBeUndefined();
    });
  });

  describe('/auth/reset-password (POST)', () => {
    it('should reset password with valid token', async () => {
      // Create a test auth
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test2@example.com',
          username: 'testuser2',
          password: 'password123',
          name: 'Test User 2',
          phone: '1234567890',
        })
        .expect(201);

      // Request password reset
      const resetResponse: { body: { resetToken: string } } = await request(
        app.getHttpServer(),
      )
        .post('/auth/forgot-password')
        .send({
          email: 'test2@example.com',
        })
        .expect(201);

      const resetToken = resetResponse.body.resetToken;

      // Reset password
      const response: { body: { message: string } } = await request(
        app.getHttpServer(),
      )
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
        })
        .expect(201);

      expect(response.body.message).toBe(
        'Password has been reset successfully',
      );

      // Test login with new password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testuser2',
          password: 'newpassword123',
        })
        .expect(201);
    });

    it('should reject invalid token', async () => {
      const response: { body: { message: string } } = await request(
        app.getHttpServer(),
      )
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123',
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    it('should reject expired token', async () => {
      // Create a test auth
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test3@example.com',
          username: 'testuser3',
          password: 'password123',
          name: 'Test User 3',
          phone: '1234567890',
        })
        .expect(201);

      // Manually create an expired token
      const auth = await prismaService.db.auth.findUnique({
        where: { email: 'test3@example.com' },
      });

      const expiredToken = 'expired-token-123';
      if (auth) {
        await prismaService.db.auth.update({
          where: { id: auth.id },
          data: {
            password_reset_token: expiredToken,
            password_reset_expires: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          },
        });
      }

      const response: { body: { message: string } } = await request(
        app.getHttpServer(),
      )
        .post('/auth/reset-password')
        .send({
          token: expiredToken,
          newPassword: 'newpassword123',
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid or expired reset token');
    });
  });
});

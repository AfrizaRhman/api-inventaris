import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        phone: '1234567890',
      })
      .expect(201);
  });

  it('/auth/login (POST)', async () => {
    // First register a auth
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'test2@example.com',
      username: 'testuser2',
      password: 'password123',
      name: 'Test User 2',
      phone: '1234567890',
    });

    // Then login
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testuser2',
        password: 'password123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('user');
      });
  });
});

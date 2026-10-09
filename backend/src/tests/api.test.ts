import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('CineVault Core API Endpoints', () => {
  it('GET /api/health should return 200 with service metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('CineVault API');
    expect(res.body.legalCompliance).toBeDefined();
  });

  it('GET /api/movies should return legal movies catalog with pagination', async () => {
    const res = await request(app).get('/api/movies?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
  });

  it('GET /api/genres should return genres with movie counts', async () => {
    const res = await request(app).get('/api/genres');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/login with valid admin credentials should return token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@cinevault.org',
      password: 'AdminPass123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  it('POST /api/auth/login with invalid password should return 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@cinevault.org',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Protected admin route without auth token should return 401', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

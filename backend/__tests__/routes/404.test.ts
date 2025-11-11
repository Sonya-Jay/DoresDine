import request from 'supertest';
import { createTestApp } from '../app';

describe('404 Handler', () => {
  const app = createTestApp();

  it('should return 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/nonexistent-route');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not found');
  });

  it('should return 404 for POST to non-existent routes', async () => {
    const response = await request(app)
      .post('/nonexistent-route')
      .send({ data: 'test' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not found');
  });
});


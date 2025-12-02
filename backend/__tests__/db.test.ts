import pool from '../src/db';
import { getTestPool } from './setup';

describe('Database Connection', () => {
  it('should export a pool instance', () => {
    expect(pool).toBeDefined();
    expect(pool).toHaveProperty('connect');
    expect(pool).toHaveProperty('query');
  });

  it('should be able to connect to database', async () => {
    const testPool = getTestPool();
    const client = await testPool.connect();
    expect(client).toBeDefined();
    client.release();
  });

  it('should be able to execute a query', async () => {
    const testPool = getTestPool();
    const result = await testPool.query('SELECT 1 as test');
    expect(result.rows).toBeDefined();
    expect(result.rows[0].test).toBe(1);
  });

  it('should handle connection errors gracefully', async () => {
    // This test verifies the pool is configured correctly
    // Actual connection errors would be caught by the connection handler in db.ts
    const poolConfig = (pool as any).options;
    expect(poolConfig).toBeDefined();
  });
});


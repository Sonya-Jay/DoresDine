# Backend Testing Guide

This guide explains how to run the backend tests and achieve 100% code coverage.

## Prerequisites

1. **Database Connection**: You must have a `DATABASE_URL` environment variable set. This can be:
   - Set in a `.env` file in the `backend/` directory
   - Set as an environment variable in your shell
   - The tests will use the same database as your development environment (tests clean up after themselves)

2. **Database Schema**: The test setup will automatically create the necessary tables if they don't exist. Make sure your database user has permissions to:
   - Create tables
   - Create indexes
   - Create extensions (uuid-ossp)

## Running Tests

### Run all tests
```bash
cd backend
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests in CI mode (with coverage, no watch)
```bash
npm run test:ci
```

## Test Structure

- **`__tests__/setup.ts`**: Test database setup and teardown
- **`__tests__/helpers.ts`**: Helper functions for creating test data
- **`__tests__/app.ts`**: Test Express app setup
- **`__tests__/routes/`**: Route tests
- **`__tests__/middleware/`**: Middleware tests
- **`__tests__/services/`**: Service tests

## Coverage Requirements

The test suite is configured to require 100% coverage for:
- Branches
- Functions
- Lines
- Statements

This ensures that all code paths are tested.

## Test Database

The tests use a dedicated test database pool that:
- Automatically cleans up data before each test
- Creates necessary tables if they don't exist
- Uses the same database as your development environment (tests are isolated by cleaning up data)

## Mocking

The following external services are mocked to prevent actual API calls:
- **Nodemailer**: Email sending is mocked
- **AWS S3**: S3 uploads are mocked
- **File System**: File operations are mocked (for local storage fallback)

## Writing New Tests

When adding new routes or features:

1. Create a test file in `__tests__/routes/` (or appropriate directory)
2. Use the `createTestApp()` function to get a test Express app
3. Use helper functions from `__tests__/helpers.ts` to create test data
4. Use `getAuthHeaders()` to create authentication headers for protected routes
5. Ensure all code paths are covered (branches, error cases, etc.)

## Troubleshooting

### "DATABASE_URL is not set" error

Make sure you have a `.env` file in the `backend/` directory with:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

Or set it as an environment variable:
```bash
export DATABASE_URL=postgresql://user:password@host:port/database
```

### Database connection errors

- Check that your database is running
- Verify that `DATABASE_URL` is correct
- Ensure your database user has the necessary permissions
- For RDS databases, make sure SSL is configured correctly (the test setup handles this automatically)

### Tests failing due to coverage

If tests fail because coverage is not 100%:
1. Check the coverage report in `coverage/` directory
2. Identify uncovered lines/branches
3. Add tests to cover those paths
4. Re-run tests with coverage to verify

## Example Test

```typescript
import request from 'supertest';
import { createTestApp } from '../app';
import { createTestUser, getAuthHeaders } from '../helpers';

describe('My Route', () => {
  const app = createTestApp();

  it('should do something', async () => {
    const user = await createTestUser();
    const response = await request(app)
      .get('/my-route')
      .set(getAuthHeaders(user.id));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
```


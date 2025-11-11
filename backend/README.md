# DoresDine Backend

Minimal, production-lean backend for creating posts with PostgreSQL.

## Schema Rationale

**Normalized 3-table design:**

1. **`users`**: Stores author information. UUID primary keys enable distributed ID generation without coordination.

2. **`posts`**: Core entity with author relationship. Caption is nullable to support photos-only posts. All timestamps use `timestamptz` for UTC storage.

3. **`post_photos`**: Normalized 1-to-many relationship supporting 0..N photos per post. Uses `display_order` for client-controlled sequencing. The `storage_key` field flexibly stores S3 keys, CDN URLs, or file paths.

**Indexes:** Cover common queries (author lookup, feed chronology, photo retrieval) and ensure unique constraints on username/email.

## How to Run Locally

### Prerequisites

- PostgreSQL 12+ installed and running
- Node.js 18+ with npm

### 1. Database Setup

```bash
# Create database
createdb doresdine

# Run migrations
psql -U postgres -d doresdine -f migrations/001_initial_schema.sql
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials if needed
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`. Health check: `http://localhost:3000/health`

## Example Requests

### 1. Create a User (for testing)

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com"
  }'
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "alice",
  "email": "alice@example.com",
  "created_at": "2025-10-14T12:00:00.000Z"
}
```

Save the `id` for the next request.

### 2. Create a Post with Photos

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "X-User-Id: a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -d '{
    "caption": "Sunday brunch at my favorite spot!",
    "photos": [
      {
        "storage_key": "posts/2025/10/pancakes_001.jpg",
        "display_order": 0
      },
      {
        "storage_key": "posts/2025/10/coffee_002.jpg",
        "display_order": 1
      }
    ]
  }'
```

**Response:**
```json
{
  "id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
  "author_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "caption": "Sunday brunch at my favorite spot!",
  "created_at": "2025-10-14T12:05:00.000Z",
  "photos": [
    {
      "id": "11223344-5566-7788-99aa-bbccddeeff00",
      "post_id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
      "storage_key": "posts/2025/10/pancakes_001.jpg",
      "display_order": 0,
      "created_at": "2025-10-14T12:05:00.000Z"
    },
    {
      "id": "22334455-6677-8899-aabb-ccddeeff0011",
      "post_id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
      "storage_key": "posts/2025/10/coffee_002.jpg",
      "display_order": 1,
      "created_at": "2025-10-14T12:05:00.000Z"
    }
  ]
}
```

### 3. Create a Post with No Photos

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "X-User-Id: a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -d '{
    "caption": "Just a thought for today."
  }'
```

### 4. Create a Photos-Only Post (no caption)

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "X-User-Id: a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -d '{
    "photos": [
      {
        "storage_key": "posts/2025/10/sunset_003.jpg",
        "display_order": 0
      }
    ]
  }'
```

## API Endpoints

### `POST /users`
Create a new user (testing only).

**Body:** `{ "username": string, "email": string }`

**Response:** `201` with user object

### `POST /posts`
Create a new post.

**Headers:** `X-User-Id: <uuid>` (auth stub)

**Body:**
```json
{
  "caption": "optional string (max 5000 chars)",
  "photos": [
    {
      "storage_key": "string (required, max 500 chars)",
      "display_order": "number (optional, defaults to 0)"
    }
  ]
}
```

**Response:** `201` with post object including photos array

### `GET /health`
Health check endpoint.

**Response:** `200` with database connection status

## Authentication Stub

Currently uses `X-User-Id` header for simplicity. For production:

- Replace with JWT or session-based auth
- Add middleware at `src/middleware/auth.ts`
- Attach `req.user` instead of reading headers in routes

## Future Extensions (Without Breaking Changes)

The schema is designed for additive growth:

**Likes:**
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
```

**Comments:**
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
```

**Shares/Bookmarks:** Similar pattern with `post_id` foreign key.

**Rich metadata:** Add `JSONB` columns to existing tables (e.g., `posts.metadata`) for optional location, tags, or settings without schema changes.

All extensions preserve existing API contracts and require only new routes.

## Project Structure

```
backend/
├── migrations/
│   └── 001_initial_schema.sql    # Database schema
├── src/
│   ├── routes/
│   │   ├── users.ts              # User creation endpoint
│   │   └── posts.ts              # Post creation endpoint
│   ├── db.ts                     # PostgreSQL connection pool
│   ├── types.ts                  # TypeScript interfaces
│   └── index.ts                  # Express app & server
├── package.json
├── tsconfig.json
└── .env.example
```

## Production Considerations

**Security:**
- Replace auth stub with proper authentication
- Add rate limiting (e.g., `express-rate-limit`)
- Validate/sanitize `storage_key` to prevent path traversal
- Enable CORS only for trusted origins

**Scaling:**
- Add read replicas for `posts` queries
- Implement cursor-based pagination for feeds
- Consider CDN for `storage_key` URLs
- Add caching layer (Redis) for hot posts

**Observability:**
- Structured logging (e.g., `pino`)
- Application metrics (e.g., Prometheus)
- Error tracking (e.g., Sentry)

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { attachUserFromToken, requireAuth, signToken } from '../../src/middleware/auth';

describe('Auth Middleware', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('attachUserFromToken', () => {
    it('should attach userId to request if valid token provided', () => {
      const userId = 'test-user-id';
      const token = signToken(userId);
      mockRequest.headers!['authorization'] = `Bearer ${token}`;

      attachUserFromToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect((mockRequest as any).userId).toBe(userId);
      expect((mockRequest.headers as any)['x-user-id']).toBe(userId);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should not attach userId if no authorization header', () => {
      attachUserFromToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect((mockRequest as any).userId).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should not attach userId if invalid token', () => {
      mockRequest.headers!['authorization'] = 'Bearer invalid-token';

      attachUserFromToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect((mockRequest as any).userId).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should not attach userId if malformed authorization header', () => {
      mockRequest.headers!['authorization'] = 'InvalidFormat token';

      attachUserFromToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect((mockRequest as any).userId).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('requireAuth', () => {
    it('should call next if userId is present', () => {
      (mockRequest as any).userId = 'test-user-id';

      requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next if x-user-id header is present', () => {
      (mockRequest.headers as any)['x-user-id'] = 'test-user-id';

      requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 if no userId or header', () => {
      requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('signToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'test-user-id';
      const token = signToken(userId);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      // Verify token can be decoded
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      expect(decoded.userId).toBe(userId);
    });

    it('should generate tokens with 7 day expiry', () => {
      const userId = 'test-user-id';
      const token = signToken(userId);

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      expect(decoded.exp).toBeDefined();
      
      const expiryTime = decoded.exp - decoded.iat;
      // Should be approximately 7 days (604800 seconds), allow some tolerance
      expect(expiryTime).toBeCloseTo(604800, -2);
    });
  });
});


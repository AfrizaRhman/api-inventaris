# Password Reset API Documentation

This document describes the password reset functionality for the DWMS API.

## Endpoints

### 1. Request Password Reset

**POST** `/auth/forgot-password`

Request a password reset token for a user account.

#### Request Body
```json
{
  "email": "user@example.com"
}
```

#### Response
```json
{
  "message": "If the email exists, a reset link has been sent.",
  "resetToken": "abc123...", // Only included in development mode
  "resetUrl": "/auth/reset-password?token=abc123..." // Only included in development mode
}
```

#### Example Usage
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### 2. Reset Password

**POST** `/auth/reset-password`

Reset a user's password using a valid reset token.

#### Request Body
```json
{
  "token": "abc123...",
  "newPassword": "newSecurePassword123"
}
```

#### Response
```json
{
  "message": "Password has been reset successfully"
}
```

#### Example Usage
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"abc123...",
    "newPassword":"newSecurePassword123"
  }'
```

## Security Features

1. **Token Expiration**: Reset tokens expire after 1 hour (3600 seconds)
2. **Single Use**: Tokens are invalidated after successful password reset
3. **Email Privacy**: The API doesn't reveal whether an email exists in the system
4. **Secure Storage**: Tokens are stored securely in the database
5. **Password Hashing**: New passwords are hashed using bcrypt with salt rounds

## Error Responses

### Invalid/Expired Token
```json
{
  "statusCode": 400,
  "message": "Invalid or expired reset token",
  "error": "Bad Request"
}
```

### Validation Errors
```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email address",
    "newPassword must be at least 6 characters long"
  ],
  "error": "Bad Request"
}
```

## Flow Diagram

```
1. User requests password reset
   ↓
2. System generates reset token (1-hour expiry)
   ↓
3. Token saved to database
   ↓
4. Email sent to user (in production)
   ↓
5. User clicks reset link with token
   ↓
6. User submits new password with token
   ↓
7. System validates token and expiry
   ↓
8. Password updated and token cleared
```

## Database Schema

The User model includes the following fields for password reset:

```prisma
model User {
  // ... other fields
  password_reset_token   String?
  password_reset_expires Int?
}
```

## Implementation Notes

### In Development
- Reset tokens are included in the API response for testing purposes
- Remove `resetToken` and `resetUrl` from responses in production

### In Production
- Implement email service to send reset links
- Use environment variables for token expiry configuration
- Add rate limiting to prevent abuse
- Log password reset attempts for security monitoring

## Testing

Run the password reset e2e tests:

```bash
npm run test:e2e -- password-reset.e2e-spec.ts
```

## Example Integration

### Frontend (React/Vue/Angular)
```javascript
// Request password reset
const requestReset = async (email) => {
  const response = await fetch('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  // Show success message to user
};

// Reset password
const resetPassword = async (token, newPassword) => {
  const response = await fetch('/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  const data = await response.json();
  if (response.ok) {
    // Redirect to login page
  } else {
    // Show error message
  }
};
```

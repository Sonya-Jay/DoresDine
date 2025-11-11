# Black Box Testing Scenarios

This document outlines error scenarios that can be tested for black box testing demonstrations.

## Login Screen Error Scenarios

### 1. Empty Email Field
- **Action**: Click login with empty email field
- **Expected**: Error message "Email is required" appears below email field
- **UI**: Email input shows red border

### 2. Empty Password Field
- **Action**: Click login with empty password field
- **Expected**: Error message "Password is required" appears below password field
- **UI**: Password input shows red border

### 3. Empty Both Fields
- **Action**: Click login with both fields empty
- **Expected**: Both fields show error messages
- **UI**: Both inputs show red borders

### 4. Invalid Email Format (Non-Vanderbilt)
- **Action**: Enter email like "test@gmail.com"
- **Expected**: Error message "Must be a Vanderbilt email (@vanderbilt.edu)"
- **UI**: Email input shows red border

### 5. Email Without Username
- **Action**: Enter only "@vanderbilt.edu"
- **Expected**: Error message "Please enter your email username"
- **UI**: Email input shows red border

### 6. Password Too Short
- **Action**: Enter password with less than 6 characters
- **Expected**: Error message "Password must be at least 6 characters"
- **UI**: Password input shows red border

### 7. Wrong Password
- **Action**: Enter correct email but wrong password
- **Expected**: Alert "Invalid email or password. Please check your credentials and try again."
- **UI**: Password field shows error "Invalid password"

### 8. Non-Existent Email
- **Action**: Enter email that doesn't exist in database
- **Expected**: Alert "Invalid email or password. Please check your credentials and try again."
- **UI**: No specific field error (security - don't reveal if email exists)

### 9. Unverified Email
- **Action**: Login with email that hasn't been verified
- **Expected**: Alert "Email Not Verified" with option to resend code
- **UI**: Alert dialog with "Resend Code" button

### 10. Valid Credentials
- **Action**: Enter correct email and password for verified account
- **Expected**: User is logged in and redirected to app
- **UI**: Navigation to main app screen

## Registration Screen Error Scenarios

### 1. Empty First Name
- **Action**: Submit form with empty first name
- **Expected**: Error message "First name is required"
- **UI**: First name input shows red border

### 2. Empty Last Name
- **Action**: Submit form with empty last name
- **Expected**: Error message "Last name is required"
- **UI**: Last name input shows red border

### 3. Empty Email Username
- **Action**: Submit form with empty email username
- **Expected**: Error message "Email username is required"
- **UI**: Email input shows red border

### 4. Empty Password
- **Action**: Submit form with empty password
- **Expected**: Error message "Password is required"
- **UI**: Password input shows red border

### 5. First Name Too Short
- **Action**: Enter first name with only 1 character
- **Expected**: Error message "First name must be at least 2 characters"
- **UI**: First name input shows red border

### 6. Last Name Too Short
- **Action**: Enter last name with only 1 character
- **Expected**: Error message "Last name must be at least 2 characters"
- **UI**: Last name input shows red border

### 7. First Name Too Long
- **Action**: Enter first name with more than 50 characters
- **Expected**: Error message "First name must be less than 50 characters"
- **UI**: First name input shows red border

### 8. Last Name Too Long
- **Action**: Enter last name with more than 50 characters
- **Expected**: Error message "Last name must be less than 50 characters"
- **UI**: Last name input shows red border

### 9. Email Username Too Short
- **Action**: Enter email username with only 1 character
- **Expected**: Error message "Email username must be at least 2 characters"
- **UI**: Email input shows red border

### 10. Invalid Email Username Characters
- **Action**: Enter email username with special characters like "user@name" or "user#name"
- **Expected**: Error message "Email username can only contain letters, numbers, dots, underscores, and hyphens"
- **UI**: Email input shows red border

### 11. Password Too Short
- **Action**: Enter password with less than 6 characters
- **Expected**: Error message "Password must be at least 6 characters"
- **UI**: Password input shows red border

### 12. Password Too Long
- **Action**: Enter password with more than 100 characters
- **Expected**: Error message "Password must be less than 100 characters"
- **UI**: Password input shows red border

### 13. Duplicate Email
- **Action**: Register with email that already exists
- **Expected**: Alert "An account with this email already exists. Please log in instead." with "Go to Login" button
- **UI**: Email field shows error "Email already registered"

### 14. Non-Vanderbilt Email
- **Action**: Try to register with non-Vanderbilt email (shouldn't be possible with current UI, but test backend)
- **Expected**: Error message "Only Vanderbilt email addresses are allowed"
- **UI**: Email input shows red border

### 15. Valid Registration
- **Action**: Fill all fields correctly with new email
- **Expected**: User is registered and redirected to verification screen
- **UI**: Navigation to verification screen with code displayed (if SMTP not configured)

## Verification Screen Error Scenarios

### 1. Empty Verification Code
- **Action**: Click verify with empty code field
- **Expected**: Button is disabled (code must be 6 digits)
- **UI**: Verify button is disabled

### 2. Invalid Code Format
- **Action**: Enter code with less than 6 digits (via API call)
- **Expected**: Error message "Verification code must be 6 digits"
- **UI**: Error alert

### 3. Wrong Verification Code
- **Action**: Enter incorrect 6-digit code
- **Expected**: Alert "Invalid verification code. Please check and try again."
- **UI**: Error alert

### 4. Expired Verification Code
- **Action**: Use code that has expired (after 15 minutes)
- **Expected**: Error message "Verification code has expired. Please request a new code."
- **UI**: Error alert

### 5. User Not Found
- **Action**: Verify with email that doesn't exist
- **Expected**: Error message "User not found"
- **UI**: Error alert

### 6. No Verification Code Set
- **Action**: Verify for user with no verification code
- **Expected**: Error message "No verification code set for this user. Please request a new code."
- **UI**: Error alert

### 7. Valid Verification
- **Action**: Enter correct 6-digit verification code
- **Expected**: User is verified and logged in, redirected to app
- **UI**: Navigation to main app screen

## Backend API Error Responses

### Login Endpoint (`POST /auth/login`)
- `400`: Missing email - "Email is required"
- `400`: Missing password - "Password is required"
- `400`: Missing both - "Email and password are required"
- `400`: Invalid email format - "Only Vanderbilt email addresses (@vanderbilt.edu) are allowed"
- `400`: Empty email username - "Please enter your email username"
- `400`: Password too short - "Password must be at least 6 characters"
- `401`: User not found - "Invalid credentials"
- `401`: Wrong password - "Invalid credentials"
- `403`: Email not verified - "Email not verified. Please verify your email before logging in."
- `500`: Server error - "Internal server error"

### Registration Endpoint (`POST /auth/register`)
- `400`: Missing first name - "Missing required fields"
- `400`: Missing last name - "Missing required fields"
- `400`: Missing email - "Missing required fields"
- `400`: Missing password - "Missing required fields"
- `400`: Invalid email format - "Only Vanderbilt email addresses (@vanderbilt.edu) are allowed"
- `400`: Password too short - "password must be a string of at least 6 characters"
- `409`: Duplicate email - "email already exists"
- `500`: Server error - "Internal server error"

### Verification Endpoint (`POST /auth/verify`)
- `400`: Missing email - "Email is required"
- `400`: Missing code - "Verification code is required"
- `400`: Invalid code format - "Verification code must be 6 digits"
- `400`: Invalid code - "Invalid verification code. Please check and try again."
- `400`: Expired code - "Verification code has expired. Please request a new code."
- `400`: No code set - "No verification code set for this user. Please request a new code."
- `404`: User not found - "User not found"
- `500`: Server error - "Internal server error"

## Testing Checklist

- [ ] Login with empty email
- [ ] Login with empty password
- [ ] Login with empty both fields
- [ ] Login with invalid email format
- [ ] Login with password too short
- [ ] Login with wrong password
- [ ] Login with non-existent email
- [ ] Login with unverified email
- [ ] Login with valid credentials
- [ ] Register with empty first name
- [ ] Register with empty last name
- [ ] Register with empty email
- [ ] Register with empty password
- [ ] Register with invalid name lengths
- [ ] Register with invalid email username
- [ ] Register with duplicate email
- [ ] Register with valid data
- [ ] Verify with empty code
- [ ] Verify with invalid code format
- [ ] Verify with wrong code
- [ ] Verify with expired code
- [ ] Verify with valid code

## Video Recording Tips

1. Start with a clean state (fresh app install or logged out)
2. Show each error scenario clearly
3. Demonstrate that errors clear when user starts typing
4. Show successful flows after error scenarios
5. Highlight the specific error messages and UI feedback
6. Test edge cases (very long inputs, special characters, etc.)
7. Show both frontend validation and backend error responses
8. Demonstrate error recovery (fixing errors and successfully submitting)


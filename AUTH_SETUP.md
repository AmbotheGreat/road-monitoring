# Authentication Setup Guide

This document explains the authentication system implemented in this Road Monitoring application using React.js and Supabase.

## 📋 Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Setup Instructions](#setup-instructions)
4. [How It Works](#how-it-works)
5. [Usage Examples](#usage-examples)
6. [Customization](#customization)

---

## ✨ Features

- **User Registration** - Sign up with email and password
- **User Login** - Sign in with email and password
- **Forgot Password** - Request password reset via email
- **Reset Password** - Update password through secure link
- **Email Verification** - Users receive verification emails upon registration
- **Resend Verification** - Users can request a new verification email
- **Persistent Sessions** - Users stay logged in even after browser refresh
- **Protected Routes** - Automatic redirect to login for unauthenticated users
- **Logout Functionality** - Sign out from anywhere in the app
- **Toast Notifications** - Beautiful success/error/info messages
- **Loading States** - All forms have proper loading indicators
- **Error Handling** - Comprehensive error handling throughout

---

## 📁 Project Structure

```
src/
┣ components/
┃ ┣ Auth/
┃ ┃ ┣ LoginForm.jsx          # Login form component
┃ ┃ ┣ RegisterForm.jsx        # Registration form component
┃ ┃ ┣ ForgotPasswordForm.jsx  # Forgot password form
┃ ┃ ┣ ResetPasswordForm.jsx   # Reset password form
┃ ┃ ┗ index.js                # Auth components exports
┃ ┣ ProtectedRoute.jsx        # Route wrapper for authentication
┃ ┗ Navbar.jsx                # Navigation bar with logout
┣ context/
┃ ┣ AuthContext.jsx           # Global auth state management
┃ ┗ ToastContext.jsx          # Toast notification system
┣ pages/
┃ ┣ LoginPage.jsx             # Login page
┃ ┣ RegisterPage.jsx          # Registration page
┃ ┣ ForgotPasswordPage.jsx    # Forgot password page
┃ ┣ ResetPasswordPage.jsx     # Reset password page
┃ ┣ Dashboard.jsx             # User dashboard (protected)
┃ ┣ NotFound.jsx              # 404 page
┃ ┣ home.jsx                  # Home/map page (protected)
┃ ┗ form.jsx                  # Report form page (protected)
┣ lib/
┃ ┗ supabase.js               # Supabase client setup
┣ App.jsx                     # Main app with routes
┣ main.jsx                    # App entry point
┗ index.css                   # Global styles + animations
```

---

## 🚀 Setup Instructions

### 1. Prerequisites

Make sure you have:
- Node.js (v16+)
- A Supabase account and project
- npm or yarn installed

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these from: [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API

### 3. Configure Supabase

#### Enable Email Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Ensure **Email** provider is enabled
4. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation and password reset emails

#### Set Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add these to your **Redirect URLs**:
   - `http://localhost:5173/reset-password` (for development)
   - `https://yourdomain.com/reset-password` (for production)

### 4. Install Dependencies

```bash
npm install
```

All required dependencies are already in `package.json`:
- `@supabase/supabase-js` - Supabase client
- `react-router-dom` - Routing
- `tailwindcss` - Styling

### 5. Run the Application

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

---

## 🔧 How It Works

### Authentication Flow

1. **Initial Load**
   - `AuthContext` checks for existing session
   - Sets up listener for auth state changes
   - Shows loading spinner while checking

2. **User Registration**
   - User fills registration form
   - Supabase creates account
   - Verification email sent
   - User can resend email if needed
   - Redirect to login

3. **User Login**
   - User enters credentials
   - Supabase validates
   - Session created and stored
   - Redirect to dashboard

4. **Forgot Password**
   - User enters email
   - Supabase sends reset link
   - Link redirects to `/reset-password`
   - User sets new password

5. **Protected Routes**
   - `ProtectedRoute` wrapper checks auth state
   - Redirects to `/login` if not authenticated
   - Shows loading spinner during check

6. **Persistent Sessions**
   - Supabase stores session in browser
   - `onAuthStateChange` listener updates state
   - User stays logged in across refreshes

### Context Providers

#### AuthContext
Provides global access to:
- `user` - Current user object
- `session` - Current session
- `loading` - Loading state
- `signUp()` - Register new user
- `signIn()` - Login user
- `signOut()` - Logout user
- `resetPassword()` - Request password reset
- `updatePassword()` - Update password
- `resendVerificationEmail()` - Resend verification

#### ToastContext
Provides toast notifications:
- `success(message)` - Show success toast
- `error(message)` - Show error toast
- `info(message)` - Show info toast
- `warning(message)` - Show warning toast

---

## 💡 Usage Examples

### Using Auth in Components

```jsx
import { useAuth } from '../context/AuthContext'

function MyComponent() {
  const { user, signOut } = useAuth()
  
  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

### Using Toast Notifications

```jsx
import { useToast } from '../context/ToastContext'

function MyComponent() {
  const { success, error } = useToast()
  
  const handleAction = async () => {
    try {
      // Do something
      success('Action completed!')
    } catch (err) {
      error('Something went wrong')
    }
  }
  
  return <button onClick={handleAction}>Do Something</button>
}
```

### Creating Protected Routes

```jsx
import ProtectedRoute from '../components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
```

---

## 🎨 Customization

### Styling

The authentication UI uses Tailwind CSS. You can customize:

1. **Colors** - Update color classes in components (e.g., `bg-blue-600` → `bg-purple-600`)
2. **Animations** - Modify `index.css` animations
3. **Form Layouts** - Edit individual form components

### Email Templates

Customize Supabase email templates:

1. Go to Supabase Dashboard
2. **Authentication** → **Email Templates**
3. Edit HTML/CSS for:
   - Confirmation email
   - Password reset email
   - Magic link email

### Add Social Auth (Optional)

To add Google, GitHub, etc.:

1. Enable provider in Supabase Dashboard
2. Update `AuthContext` to include social sign-in methods:

```jsx
signInWithGoogle: async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })
  return { data, error }
}
```

3. Add buttons in `LoginForm.jsx`

### Password Requirements

To enforce stronger passwords, update `RegisterForm.jsx`:

```jsx
if (password.length < 8) {
  showError('Password must be at least 8 characters')
  return
}

if (!/[A-Z]/.test(password)) {
  showError('Password must contain an uppercase letter')
  return
}
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Always use `.env.example`
2. **Use HTTPS in production** - Required for secure cookies
3. **Set up Row Level Security (RLS)** in Supabase for database tables
4. **Validate user input** - Both client and server side
5. **Implement rate limiting** - Use Supabase built-in rate limits
6. **Keep dependencies updated** - Run `npm audit` regularly

---

## 🐛 Troubleshooting

### Email Not Sending
- Check Supabase email provider settings
- Verify email templates are enabled
- Check spam folder
- In development, check Supabase logs

### Session Not Persisting
- Check browser localStorage is enabled
- Verify Supabase URL and keys are correct
- Check for CORS issues

### Redirect Not Working
- Verify redirect URLs in Supabase settings
- Check URL matches exactly (including protocol)
- Clear browser cache

### User Already Registered Error
- Email is already in use
- Check Supabase auth users list
- User may need to verify email first

---

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

---

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Check Supabase Dashboard → Logs
4. Ensure all dependencies are installed
5. Try clearing browser cache and localStorage

---

## ✅ Testing the System

1. **Register a new user** at `/register`
2. **Check email** for verification link
3. **Login** at `/login`
4. **Access dashboard** - Should redirect if not logged in
5. **Test forgot password** at `/forgot-password`
6. **Logout** - Should redirect to login
7. **Try accessing protected route** - Should redirect to login

---

Congratulations! 🎉 Your authentication system is now fully set up and ready to use.

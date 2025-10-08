# Authentication Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Set Environment Variables

Create `.env` file in root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Configure Supabase

In your Supabase Dashboard:

1. **Enable Email Auth**: Authentication → Providers → Enable Email
2. **Add Redirect URL**: Authentication → URL Configuration → Add:
   - `http://localhost:5173/reset-password`

### 3. Run the App

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## 🎯 Available Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/forgot-password` | Public | Request password reset |
| `/reset-password` | Public | Set new password (via email link) |
| `/dashboard` | Protected | User dashboard |
| `/` | Protected | Home/Map view |
| `/form` | Protected | Report form |

---

## 💻 Code Examples

### Get Current User

```jsx
import { useAuth } from './context/AuthContext'

function MyComponent() {
  const { user } = useAuth()
  
  return <div>Logged in as: {user?.email}</div>
}
```

### Show Notifications

```jsx
import { useToast } from './context/ToastContext'

function MyComponent() {
  const { success, error } = useToast()
  
  const handleClick = () => {
    success('It worked!')
    // or
    error('Something went wrong')
  }
  
  return <button onClick={handleClick}>Click me</button>
}
```

### Logout User

```jsx
import { useAuth } from './context/AuthContext'
import { useNavigate } from 'react-router-dom'

function LogoutButton() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  
  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }
  
  return <button onClick={handleLogout}>Logout</button>
}
```

### Create Protected Route

```jsx
import ProtectedRoute from './components/ProtectedRoute'

<Route
  path="/my-protected-page"
  element={
    <ProtectedRoute>
      <MyPage />
    </ProtectedRoute>
  }
/>
```

---

## 🔧 Common Tasks

### Customize Form Styling

Edit files in `src/components/Auth/`:
- `LoginForm.jsx`
- `RegisterForm.jsx`
- `ForgotPasswordForm.jsx`
- `ResetPasswordForm.jsx`

### Change Brand Colors

Replace `blue` with your color throughout:
- `bg-blue-600` → `bg-purple-600`
- `text-blue-600` → `text-purple-600`

### Add More User Info

Update registration in `RegisterForm.jsx`:

```jsx
const { data, error } = await signUp(email, password, {
  data: {
    full_name: fullName,
    phone: phone
  }
})
```

### Check if Email Verified

```jsx
const { user } = useAuth()
const isVerified = user?.email_confirmed_at !== null
```

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Check `.env` file has correct keys |
| Email not sending | Check Supabase email settings |
| Session not persisting | Clear browser localStorage |
| Redirect not working | Add URL to Supabase settings |
| Can't access protected route | Make sure you're logged in |

---

## 📝 Testing Checklist

- [ ] Register new user
- [ ] Receive verification email
- [ ] Login with credentials
- [ ] Access dashboard
- [ ] Try to access protected route when logged out
- [ ] Reset password flow
- [ ] Logout successfully
- [ ] Session persists after page refresh

---

## 🔐 Security Notes

✅ **DO:**
- Use environment variables for keys
- Enable RLS on database tables
- Validate user input
- Use HTTPS in production

❌ **DON'T:**
- Commit `.env` file
- Use API keys in client code
- Trust client-side validation alone
- Skip email verification

---

## 📚 Learn More

- Full setup guide: See `AUTH_SETUP.md`
- Supabase Docs: https://supabase.com/docs/guides/auth
- React Router: https://reactrouter.com/

---

**Need help?** Check browser console and Supabase logs for errors.

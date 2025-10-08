# 🚀 Getting Started with Authentication

## Step-by-Step Setup (5 Minutes)

Follow these steps to get your authentication system running:

---

## Step 1: Environment Setup ⚙️

### Create `.env` File

1. Copy the template:
   ```bash
   cp env.template .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## Step 2: Configure Supabase 🔧

### Enable Email Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (should be by default)
3. ✅ That's it!

### Add Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, click **Add URL**
3. Add these URLs:
   - Development: `http://localhost:5173/reset-password`
   - Production: `https://yourdomain.com/reset-password` (when deploying)
4. Click **Save**

### Optional: Customize Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize the look of:
   - Confirmation email (sent after registration)
   - Password reset email
   - Magic link email

---

## Step 3: Install & Run 🏃‍♂️

### Install Dependencies

```bash
npm install
```

*(All required packages are already in `package.json`)*

### Start Development Server

```bash
npm run dev
```

The app should open at: **http://localhost:5173**

---

## Step 4: Test the System ✅

### Test Registration

1. Navigate to http://localhost:5173/register
2. Enter an email and password (min 6 characters)
3. Click **Sign Up**
4. Check your email inbox
5. Click the confirmation link
6. ✅ Success!

### Test Login

1. Navigate to http://localhost:5173/login
2. Enter your registered email and password
3. Click **Sign In**
4. You should be redirected to `/dashboard`
5. ✅ You're logged in!

### Test Protected Routes

1. While logged in, visit http://localhost:5173/dashboard
2. You should see your dashboard
3. Log out using the **Sign Out** button
4. Try to visit http://localhost:5173/dashboard again
5. You should be redirected to `/login`
6. ✅ Routes are protected!

### Test Password Reset

1. Go to http://localhost:5173/forgot-password
2. Enter your email
3. Click **Send Reset Link**
4. Check your email
5. Click the reset link
6. Enter a new password
7. Click **Update Password**
8. ✅ Password changed!

---

## 🎉 You're All Set!

Your authentication system is now fully functional. Here's what you can do:

### Available Routes

| URL | What It Does |
|-----|--------------|
| `/register` | Create a new account |
| `/login` | Sign in to your account |
| `/forgot-password` | Request password reset |
| `/dashboard` | View your dashboard |
| `/` | View the map (protected) |
| `/form` | Submit road reports (protected) |

### Using Auth in Your Code

```jsx
import { useAuth } from './context/AuthContext'

function MyComponent() {
  const { user, signOut } = useAuth()
  
  return (
    <div>
      <p>Welcome, {user?.email}!</p>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

### Showing Toast Notifications

```jsx
import { useToast } from './context/ToastContext'

function MyComponent() {
  const { success, error } = useToast()
  
  const doSomething = () => {
    success('It worked!')
    // or
    error('Oops, something went wrong')
  }
  
  return <button onClick={doSomething}>Click me</button>
}
```

---

## 📚 Next Steps

### Learn More

- **Full Setup Guide**: Read `AUTH_SETUP.md` for detailed explanations
- **Quick Reference**: Check `AUTH_QUICK_START.md` for code examples
- **Project Structure**: See `PROJECT_STRUCTURE.md` for file organization
- **Implementation Details**: Review `AUTHENTICATION_SUMMARY.md`

### Customize Your App

1. **Change Colors**: Replace `blue` with your brand color in component files
2. **Add Logo**: Update the navbar in `src/components/Navbar.jsx`
3. **Modify Dashboard**: Edit `src/pages/Dashboard.jsx`
4. **Add Profile Page**: Create a new protected page
5. **Social Login**: Add Google, GitHub, etc. (see AUTH_SETUP.md)

### Deploy to Production

When ready to deploy:

1. Update redirect URLs in Supabase to your production domain
2. Set environment variables in your hosting platform
3. Build the app: `npm run build`
4. Deploy the `dist` folder

---

## 🆘 Having Issues?

### Common Problems

**"Invalid API key" error**
- Check your `.env` file has the correct values
- Make sure you copied the full keys (they're long!)
- Restart the dev server after changing `.env`

**Email not arriving**
- Check spam folder
- Verify email provider is configured in Supabase
- Check Supabase logs in Dashboard

**Can't access dashboard**
- Make sure you're logged in
- Check browser console for errors
- Clear browser cache and localStorage

**Session not persisting**
- Check browser localStorage is enabled
- Verify Supabase URL is correct
- Check for browser extensions blocking cookies

### Still Stuck?

1. Check the browser console for error messages
2. Check Supabase Dashboard → Logs
3. Review `AUTH_SETUP.md` troubleshooting section
4. Make sure all dependencies are installed: `npm install`

---

## 📞 Resources

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **React Router**: https://reactrouter.com/
- **Tailwind CSS**: https://tailwindcss.com/

---

## ✅ Quick Checklist

Before you start developing:

- [ ] `.env` file created with Supabase credentials
- [ ] Email authentication enabled in Supabase
- [ ] Redirect URLs added to Supabase
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Tested registration and login
- [ ] Verified protected routes work
- [ ] Toast notifications appearing

---

**Happy coding! 🎊** You're ready to build amazing features with secure authentication.

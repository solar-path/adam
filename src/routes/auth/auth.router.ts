import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../../lib/database';
import { userTable } from '../../lib/schema.drizzle';
import { html } from 'hono/html';
import { auth } from '../../lib/auth';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';

const authRouter = new Hono();

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Helper to render sign up form
const renderSignUpForm = (errors?: { [key: string]: string }) => {
  return html`
    <div class="auth-form">
      <h2>Sign Up</h2>
      <form 
        hx-post="/api/auth/signup"
        hx-target="this"
        hx-swap="outerHTML"
      >
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            name="email" 
            id="email" 
            required
          >
          ${errors?.email ? html`<span class="error">${errors.email}</span>` : ''}
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            name="password" 
            id="password" 
            required
          >
          ${errors?.password ? html`<span class="error">${errors.password}</span>` : ''}
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input 
            type="password" 
            name="confirmPassword" 
            id="confirmPassword" 
            required
          >
          ${errors?.confirmPassword ? html`<span class="error">${errors.confirmPassword}</span>` : ''}
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <div class="auth-links">
        <a href="/signin">Already have an account? Sign in</a>
      </div>
    </div>
  `;
};

// Helper to render sign in form
const renderSignInForm = (errors?: { [key: string]: string }) => {
  return html`
    <div class="auth-form">
      <h2>Sign In</h2>
      <form 
        hx-post="/api/auth/signin"
        hx-target="this"
        hx-swap="outerHTML"
      >
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            name="email" 
            id="email" 
            required
          >
          ${errors?.email ? html`<span class="error">${errors.email}</span>` : ''}
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            name="password" 
            id="password" 
            required
          >
          ${errors?.password ? html`<span class="error">${errors.password}</span>` : ''}
        </div>
        <button type="submit">Sign In</button>
      </form>
      <div class="auth-links">
        <a href="/signup">Don't have an account? Sign up</a>
        <a href="/forgot-password">Forgot password?</a>
      </div>
    </div>
  `;
};

// Helper to render forgot password form
const renderForgotPasswordForm = (errors?: { [key: string]: string }, success?: boolean) => {
  return html`
    <div class="auth-form">
      <h2>Forgot Password</h2>
      ${success 
        ? html`<div class="success">Password reset instructions have been sent to your email.</div>`
        : html`
          <form 
            hx-post="/api/auth/forgot-password"
            hx-target="this"
            hx-swap="outerHTML"
          >
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                required
              >
              ${errors?.email ? html`<span class="error">${errors.email}</span>` : ''}
            </div>
            <button type="submit">Reset Password</button>
          </form>
      `}
      <div class="auth-links">
        <a href="/signin">Back to Sign In</a>
      </div>
    </div>
  `;
};

// Helper to render reset password form
const renderResetPasswordForm = (token: string, errors?: { [key: string]: string }) => {
  return html`
    <div class="auth-form">
      <h2>Reset Password</h2>
      <form 
        hx-post="/api/auth/reset-password"
        hx-target="this"
        hx-swap="outerHTML"
      >
        <input type="hidden" name="token" value="${token}">
        <div class="form-group">
          <label for="password">New Password</label>
          <input 
            type="password" 
            name="password" 
            id="password" 
            required
          >
          ${errors?.password ? html`<span class="error">${errors.password}</span>` : ''}
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm New Password</label>
          <input 
            type="password" 
            name="confirmPassword" 
            id="confirmPassword" 
            required
          >
          ${errors?.confirmPassword ? html`<span class="error">${errors.confirmPassword}</span>` : ''}
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  `;
};

// Helper to render profile page
const renderProfile = (user: { email: string; isVerified: boolean }) => {
  return html`
    <div class="profile">
      <h2>Profile</h2>
      <div class="profile-info">
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Status:</strong> ${user.isVerified ? 'Verified' : 'Not Verified'}</p>
        ${!user.isVerified ? html`
          <button 
            hx-post="/api/auth/resend-verification"
            hx-target="closest .profile"
            hx-swap="outerHTML"
          >Resend Verification Email</button>
        ` : ''}
      </div>
      <form 
        hx-post="/api/auth/signout"
        hx-target="body"
      >
        <button type="submit">Sign Out</button>
      </form>
    </div>
  `;
};

// Get sign up form
authRouter.get('/signup', (c) => {
  return c.html(renderSignUpForm());
});

// Handle sign up
authRouter.post('/signup', zValidator('form', signUpSchema), async (c) => {
  const data = c.req.valid('form');
  
  // Check if user already exists
  const existingUser = await db.select()
    .from(userTable)
    .where(eq(userTable.email, data.email))
    .get();

  if (existingUser) {
    return c.html(renderSignUpForm({ email: 'Email already in use' }));
  }

  const userId = generateId(15);
  const hashedPassword = await new Argon2id().hash(data.password);
  const verificationToken = generateId(32);

  // Create user
  await db.insert(userTable)
    .values({
      id: userId,
      email: data.email,
      hashedPassword,
      verificationToken,
      isVerified: false
    })
    .run();

  // TODO: Send verification email
  console.log('Verification token:', verificationToken);

  // Create session
  const session = await auth.createSession(userId, {});
  const sessionCookie = auth.createSessionCookie(session.id);
  c.header('Set-Cookie', sessionCookie.serialize());

  return c.redirect('/todos');
});

// Get sign in form
authRouter.get('/signin', (c) => {
  return c.html(renderSignInForm());
});

// Handle sign in
authRouter.post('/signin', zValidator('form', signInSchema), async (c) => {
  const data = c.req.valid('form');
  
  const user = await db.select()
    .from(userTable)
    .where(eq(userTable.email, data.email))
    .get();

  if (!user) {
    return c.html(renderSignInForm({ email: 'Invalid email or password' }));
  }

  const validPassword = await new Argon2id().verify(user.hashedPassword, data.password);
  if (!validPassword) {
    return c.html(renderSignInForm({ password: 'Invalid email or password' }));
  }

  const session = await auth.createSession(user.id, {});
  const sessionCookie = auth.createSessionCookie(session.id);
  c.header('Set-Cookie', sessionCookie.serialize());

  return c.redirect('/todos');
});

// Handle sign out
authRouter.post('/signout', async (c) => {
  const authRequest = auth.handleRequest(c);
  const session = await authRequest.validate();
  
  if (!session) {
    return c.redirect('/signin');
  }

  await auth.invalidateSession(session.id);
  const sessionCookie = auth.createBlankSessionCookie();
  c.header('Set-Cookie', sessionCookie.serialize());
  
  return c.redirect('/signin');
});

// Get forgot password form
authRouter.get('/forgot-password', (c) => {
  return c.html(renderForgotPasswordForm());
});

// Handle forgot password
authRouter.post('/forgot-password', zValidator('form', forgotPasswordSchema), async (c) => {
  const data = c.req.valid('form');
  
  const user = await db.select()
    .from(userTable)
    .where(eq(userTable.email, data.email))
    .get();

  if (user) {
    const resetToken = generateId(32);
    const resetTokenExpiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    await db.update(userTable)
      .set({
        resetToken,
        resetTokenExpiresAt
      })
      .where(eq(userTable.id, user.id))
      .run();

    // TODO: Send reset password email
    console.log('Reset token:', resetToken);
  }

  return c.html(renderForgotPasswordForm({}, true));
});

// Get reset password form
authRouter.get('/reset-password', (c) => {
  const token = c.req.query('token');
  if (!token) {
    return c.redirect('/forgot-password');
  }
  return c.html(renderResetPasswordForm(token));
});

// Handle reset password
authRouter.post('/reset-password', zValidator('form', resetPasswordSchema), async (c) => {
  const data = c.req.valid('form');
  
  const user = await db.select()
    .from(userTable)
    .where(eq(userTable.resetToken, data.token))
    .get();

  if (!user || !user.resetTokenExpiresAt || new Date(user.resetTokenExpiresAt) < new Date()) {
    return c.html(renderResetPasswordForm(data.token, { 
      password: 'Invalid or expired reset token' 
    }));
  }

  const hashedPassword = await new Argon2id().hash(data.password);

  await db.update(userTable)
    .set({
      hashedPassword,
      resetToken: null,
      resetTokenExpiresAt: null
    })
    .where(eq(userTable.id, user.id))
    .run();

  return c.redirect('/signin');
});

// Get profile page
authRouter.get('/profile', async (c) => {
  const authRequest = auth.handleRequest(c);
  const session = await authRequest.validate();
  
  if (!session) {
    return c.redirect('/signin');
  }

  const user = await db.select()
    .from(userTable)
    .where(eq(userTable.id, session.user.userId))
    .get();

  if (!user) {
    return c.redirect('/signin');
  }

  return c.html(renderProfile({
    email: user.email,
    isVerified: user.isVerified
  }));
});

// Handle email verification
authRouter.get('/verify', async (c) => {
  const token = c.req.query('token');
  if (!token) {
    return c.redirect('/profile');
  }

  const user = await db.select()
    .from(userTable)
    .where(eq(userTable.verificationToken, token))
    .get();

  if (!user) {
    return c.text('Invalid verification token', 400);
  }

  await db.update(userTable)
    .set({
      isVerified: true,
      verificationToken: null
    })
    .where(eq(userTable.id, user.id))
    .run();

  return c.redirect('/profile');
});

// Handle resend verification email
authRouter.post('/resend-verification', async (c) => {
  const authRequest = auth.handleRequest(c);
  const session = await authRequest.validate();
  
  if (!session) {
    return c.redirect('/signin');
  }

  const user = await db.select()
    .from(userTable)
    .where(eq(userTable.id, session.user.userId))
    .get();

  if (!user || user.isVerified) {
    return c.redirect('/profile');
  }

  const verificationToken = generateId(32);

  await db.update(userTable)
    .set({ verificationToken })
    .where(eq(userTable.id, user.id))
    .run();

  // TODO: Send verification email
  console.log('New verification token:', verificationToken);

  return c.html(renderProfile({
    email: user.email,
    isVerified: false
  }));
});

export default authRouter;

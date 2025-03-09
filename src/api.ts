
import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { logger } from 'hono/logger';
import { html } from 'hono/html';
import todoRouter from './routes/todo/todo.router';
import authRouter from './routes/auth/auth.router';
import { auth } from './lib/auth';

const app = new Hono();

app.use('*', prettyJSON());
app.use('*', logger());

// Serve static files
app.use('*', async (c, next) => {
  const path = c.req.path;
  if (path.startsWith('/static/')) {
    // TODO: Implement static file serving
    return c.notFound();
  }
  await next();
});

// Authentication middleware for protected routes
app.use('/todos/*', async (c, next) => {
  const authRequest = auth.handleRequest(c);
  const session = await authRequest.validate();
  if (!session) {
    return c.redirect('/signin');
  }
  await next();
});

// Main page redirect
app.get('/', (c) => c.redirect('/todos'));

// Todo list page
app.get('/todos', async (c) => {
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Todo List</title>
      <script src="https://unpkg.com/htmx.org@1.9.10"></script>
      <style>
        /* Add your CSS styles here */
        body {
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .todo-item {
          border: 1px solid #ddd;
          padding: 15px;
          margin: 10px 0;
          border-radius: 4px;
        }
        .todo-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        .todo-form {
          margin: 20px 0;
        }
        button {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          background: #0070f3;
          color: white;
          cursor: pointer;
        }
        button:hover {
          background: #0051cc;
        }
        .delete-btn {
          background: #dc2626;
        }
        .delete-btn:hover {
          background: #b91c1c;
        }
        input[type="text"],
        textarea {
          width: 100%;
          padding: 8px;
          margin: 4px 0;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <nav>
        <a href="/profile">Profile</a>
        <form 
          style="display: inline;"
          hx-post="/api/auth/signout"
          hx-target="body"
        >
          <button type="submit">Sign Out</button>
        </form>
      </nav>
      <h1>Todo List</h1>
      <div class="todo-form">
        <form 
          hx-post="/api/todos"
          hx-target=".todos-list"
          hx-swap="afterbegin"
        >
          <input 
            type="text" 
            name="title" 
            placeholder="Todo title"
            required
          >
          <textarea 
            name="description" 
            placeholder="Todo description"
            required
          ></textarea>
          <button type="submit">Add Todo</button>
        </form>
      </div>
      <div 
        class="todos-list"
        hx-get="/api/todos"
        hx-trigger="load"
      ></div>
    </body>
    </html>
  `);
});

// API routes
app.route('/api/todos', todoRouter);
app.route('/api/auth', authRouter);

export default app;

export type ApiRoutes = typeof app;
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '../../lib/database';
import { todoTable } from '../../lib/schema.drizzle';
import { html } from 'hono/html';
import type { Context } from 'hono';

type TodoHono = Hono<{ Variables: { userId: string } }>;

const todoRouter = new Hono() as TodoHono;

// Validation schemas
const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  status: z.boolean().optional(),
});

// Helper to render a single todo item
const renderTodoItem = (todo: typeof todoTable.$inferSelect) => {
  return html`
    <div class="todo-item" id="todo-${todo.id}">
      <h3>${todo.title}</h3>
      <p>${todo.description}</p>
      <div class="todo-actions">
        <input 
          type="checkbox" 
          ${todo.status ? 'checked' : ''}
          hx-put="/api/todos/${todo.id}"
          hx-vals='{"status": ${!todo.status}}'
          hx-target="#todo-${todo.id}"
          hx-swap="outerHTML"
        >
        <button 
          hx-delete="/api/todos/${todo.id}"
          hx-target="#todo-${todo.id}"
          hx-swap="outerHTML"
          class="delete-btn"
        >Delete</button>
        <button 
          hx-get="/api/todos/${todo.id}/edit"
          hx-target="#todo-${todo.id}"
          hx-swap="outerHTML"
          class="edit-btn"
        >Edit</button>
      </div>
    </div>
  `;
};

// Helper to render edit form
const renderEditForm = (todo: typeof todoTable.$inferSelect) => {
  return html`
    <div class="todo-edit-form" id="todo-${todo.id}">
      <form 
        hx-put="/api/todos/${todo.id}"
        hx-target="#todo-${todo.id}"
        hx-swap="outerHTML"
      >
        <input 
          type="text" 
          name="title" 
          value="${todo.title}"
          required
        >
        <textarea 
          name="description" 
          required
        >${todo.description}</textarea>
        <button type="submit">Save</button>
        <button 
          type="button"
          hx-get="/api/todos/${todo.id}"
          hx-target="#todo-${todo.id}"
          hx-swap="outerHTML"
        >Cancel</button>
      </form>
    </div>
  `;
};

// Create todo
todoRouter.post('/', zValidator('json', createTodoSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');
  
  const newTodo = await db.insert(todoTable)
    .values({
      ...data,
      userId
    })
    .returning()
    .get();

  return c.html(renderTodoItem(newTodo));
});

// Get all todos for the authenticated user
todoRouter.get('/', async (c) => {
  const userId = c.get('userId');
  const todos = await db.select()
    .from(todoTable)
    .where(eq(todoTable.userId, userId))
    .all();
  
  return c.html(html`
    <div class="todos-list">
      ${todos.map(todo => renderTodoItem(todo))}
    </div>
  `);
});

// Get single todo
todoRouter.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = Number(c.req.param('id'));
  
  const todo = await db.select()
    .from(todoTable)
    .where(
      and(
        eq(todoTable.id, id),
        eq(todoTable.userId, userId)
      )
    )
    .get();

  if (!todo) {
    return c.notFound();
  }

  return c.html(renderTodoItem(todo));
});

// Get edit form
todoRouter.get('/:id/edit', async (c) => {
  const userId = c.get('userId');
  const id = Number(c.req.param('id'));
  
  const todo = await db.select()
    .from(todoTable)
    .where(
      and(
        eq(todoTable.id, id),
        eq(todoTable.userId, userId)
      )
    )
    .get();

  if (!todo) {
    return c.notFound();
  }

  return c.html(renderEditForm(todo));
});

// Update todo
todoRouter.put('/:id', zValidator('json', updateTodoSchema), async (c) => {
  const userId = c.get('userId');
  const id = Number(c.req.param('id'));
  const data = c.req.valid('json');
  
  const updatedTodo = await db.update(todoTable)
    .set({
      ...data,
      updatedAt: new Date().toISOString()
    })
    .where(
      and(
        eq(todoTable.id, id),
        eq(todoTable.userId, userId)
      )
    )
    .returning()
    .get();

  if (!updatedTodo) {
    return c.notFound();
  }

  return c.html(renderTodoItem(updatedTodo));
});

// Delete todo
todoRouter.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = Number(c.req.param('id'));
  
  await db.delete(todoTable)
    .where(
      and(
        eq(todoTable.id, id),
        eq(todoTable.userId, userId)
      )
    )
    .run();

  return c.body(null, 200);
});

export default todoRouter;
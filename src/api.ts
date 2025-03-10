import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { serveStatic } from "hono/bun";
import { db } from "./lib/database";
import { todoTable } from "./lib/drizzle.schema";
import { eq, desc } from "drizzle-orm";

const app = new Hono();

const TodoSchema = z.object({
    id: z.number(),
    title: z.string().min(1),
    status: z.string(),
    createdAt: z.string(),
    updatedAt: z.string().nullable()
});

const CreateTodoSchema = z.object({
    title: z.string().min(1)
});

type Todo = z.infer<typeof TodoSchema>;

const renderTodoRow = (todo: Todo) => `
    <tr class="${todo.status === 'completed' ? 'completed' : ''}">
        <td>${todo.id}</td>
        <td>${todo.title}</td>
        <td>${todo.status}</td>
        <td>${todo.createdAt}</td>
        <td>${todo.updatedAt || ''}</td>
        <td>
            <button class="delete-btn" 
                    hx-delete="/todo/${todo.id}" 
                    hx-target="closest tr" 
                    hx-swap="outerHTML"
                    hx-confirm="Are you sure you want to delete this todo?">
                Delete
            </button>
            <button class="toggle-btn"
                    hx-patch="/todo/${todo.id}/status"
                    hx-target="closest tr"
                    hx-swap="outerHTML">
                Toggle Status
            </button>
        </td>
    </tr>
`;

app.use('/*', serveStatic({ root: './public' }))
app.get('/version', c => c.text(Bun.version))

// Get all todos
app.get('/todo', async (c) => {
    const todoList = await db.select().from(todoTable);
    const validatedTodos = todoList.map(todo => TodoSchema.parse(todo));
    const todosHtml = validatedTodos.map(renderTodoRow).join('');
    return c.html(todosHtml);
})

// Get todo by id
app.get('/todo/:id', 
    zValidator('param', z.object({
        id: z.string().transform((val) => Number(val))
    })),
    async (c) => {
        const { id } = c.req.valid('param');
        const [todo] = await db.select().from(todoTable).where(eq(todoTable.id, id));
        
        if (!todo) {
            return c.json({ error: 'Todo not found' }, 404);
        }

        return c.json(TodoSchema.parse(todo));
    }
);

// Create todo
app.post('/todo',
    zValidator('form', CreateTodoSchema),
    async (c) => {
        const { title } = c.req.valid('form');
        
        // Get the highest ID and increment it
        const [lastTodo] = await db.select().from(todoTable).orderBy(desc(todoTable.id)).limit(1);
        const newId = lastTodo ? lastTodo.id + 1 : 1;

        const newTodo = {
            id: newId,
            title: title.trim(),
            status: 'pending',
            createdAt: new Date().toISOString().replace('T', ' '),
            updatedAt: null
        };
        
        await db.insert(todoTable).values(newTodo);
        return c.html(renderTodoRow(TodoSchema.parse(newTodo)));
    }
);

// Update todo status
app.patch('/todo/:id/status',
    zValidator('param', z.object({
        id: z.string().transform((val) => Number(val))
    })),
    async (c) => {
        const { id } = c.req.valid('param');
        const [todo] = await db.select().from(todoTable).where(eq(todoTable.id, id));
        
        if (!todo) {
            return c.json({ error: 'Todo not found' }, 404);
        }
        
        const newStatus = todo.status === 'pending' ? 'completed' : 'pending';
        const updatedAt = new Date().toISOString();
        
        await db.update(todoTable)
            .set({ status: newStatus, updatedAt })
            .where(eq(todoTable.id, id));
        
        return c.html(renderTodoRow(TodoSchema.parse({
            ...todo,
            status: newStatus,
            updatedAt
        })));
    }
);

// Delete todo
app.delete('/todo/:id',
    zValidator('param', z.object({
        id: z.string().transform((val) => Number(val))
    })),
    async (c) => {
        const { id } = c.req.valid('param');
        await db.delete(todoTable).where(eq(todoTable.id, id));
        return c.text('');
    }
);

export default app;
import { Hono } from "hono";
import { logger } from "hono/logger";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { serveStatic } from "hono/bun";

const app = new Hono();

const TodoSchema = z.object({
    id: z.number(),
    title: z.string().min(1),
    status: z.enum(['pending', 'completed'])
});

const CreateTodoSchema = z.object({
    title: z.string().min(1)
});

type Todo = z.infer<typeof TodoSchema>;

const todoList: Todo[] = [
    {
        id: 1, 
        title: 'first task',
        status: 'completed'
    },
    {
        id: 2, 
        title: 'second task',
        status: 'completed'
    },
    {
        id: 3, 
        title: 'third task',
        status: 'completed'
    }
];

const renderTodoRow = (todo: Todo) => `
    <tr class="${todo.status === 'completed' ? 'completed' : ''}">
        <td>${todo.id}</td>
        <td>${todo.title}</td>
        <td>${todo.status}</td>
        <td>
            <button class="delete-btn" 
                    hx-delete="/todo/${todo.id}" 
                    hx-target="closest tr" 
                    hx-swap="outerHTML">Delete</button>
            <button class="status-btn"
                    hx-patch="/todo/${todo.id}/status" 
                    hx-target="closest tr"
                    hx-swap="outerHTML"
                    hx-vals='{"status": "${todo.status === 'completed' ? 'pending' : 'completed'}"}'
            >${todo.status === 'completed' ? '↺ Mark Pending' : '✓ Complete'}</button>
        </td>
    </tr>
`;

app.use(logger())
app.use('/*', serveStatic({ root: './public' }))

// Get bun version 
app.get('/version', c => c.text(Bun.version))

// Get all todos
app.get('/todo', (c) => {
    const todosHtml = todoList.map(renderTodoRow).join('')
    return c.html(todosHtml)
})

// Get todo by id
app.get('/todo/:id', 
    zValidator('param', z.object({
        id: z.string().transform((val) => Number(val))
    })),
    (c) => {
        const { id } = c.req.valid('param');
        const todo = todoList.find(todo => todo.id === id);
        
        if (!todo) {
            return c.json({ error: 'Todo not found' }, 404);
        }
        
        return c.html(renderTodoRow(todo));
    }
)

// Create new todo
app.post('/todo',
    async (c) => {
        const body = await c.req.parseBody();
        const title = body.title;
        
        if (typeof title !== 'string' || !title.trim()) {
            return c.json({ error: 'Invalid title' }, 400);
        }

        const newTodo: Todo = {
            id: todoList.length > 0 ? Math.max(...todoList.map(t => t.id)) + 1 : 1,
            title: title.trim(),
            status: 'pending'
        };
        
        todoList.push(newTodo);
        return c.html(renderTodoRow(newTodo));
    }
)

// Update todo status
app.patch('/todo/:id/status',
    zValidator('param', z.object({
        id: z.string().transform((val) => Number(val))
    })),
    async (c) => {
        const { id } = c.req.valid('param');
        const body = await c.req.parseBody();
        const status = body.status;

        if (status !== 'pending' && status !== 'completed') {
            return c.json({ error: 'Invalid status' }, 400);
        }

        const todo = todoList.find(todo => todo.id === id);
        if (!todo) {
            return c.json({ error: 'Todo not found' }, 404);
        }
        
        todo.status = status;
        return c.html(renderTodoRow(todo));
    }
)

// Delete todo
app.delete('/todo/:id',
    zValidator('param', z.object({
        id: z.string().transform((val) => Number(val))
    })),
    (c) => {
        const { id } = c.req.valid('param');
        const index = todoList.findIndex(todo => todo.id === id);
        
        if (index === -1) {
            return c.json({ error: 'Todo not found' }, 404);
        }
        
        todoList.splice(index, 1);
        return c.text(''); // HTMX will remove the element on empty response
    }
)

export default app;
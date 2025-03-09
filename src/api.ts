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

app.use(logger())

app.get("/*", serveStatic({ root: './public' }))

// Get all todos
app.get('/todo', (c) => c.json({
    result: todoList
}))
// Get todo by id
.get('/todo/:id', 
    zValidator('param', z.object({
        id: z.string().transform((val) => Number(val))
    })),
    (c) => {
        const { id } = c.req.valid('param');
        const todo = todoList.find(todo => todo.id === id);
        
        if (!todo) {
            return c.json({ error: 'Todo not found' }, 404);
        }
        
        return c.json({ result: todo });
    }
)
// Create new todo
.post('/todo',
    zValidator('json', CreateTodoSchema),
    (c) => {
        const { title } = c.req.valid('json');
        const newTodo: Todo = {
            id: todoList.length > 0 ? Math.max(...todoList.map(t => t.id)) + 1 : 1,
            title,
            status: 'pending'
        };
        
        todoList.push(newTodo);
        return c.json({ result: newTodo }, 201);
    }
)
// Update todo status
.patch('/todo/:id/status',
    zValidator('param', z.object({
        id: z.string().transform((val) => Number(val))
    })),
    zValidator('json', z.object({
        status: z.enum(['pending', 'completed'])
    })),
    (c) => {
        const { id } = c.req.valid('param');
        const { status } = c.req.valid('json');
        
        const todo = todoList.find(todo => todo.id === id);
        if (!todo) {
            return c.json({ error: 'Todo not found' }, 404);
        }
        
        todo.status = status;
        return c.json({ result: todo });
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
        return c.json({ result: 'Todo deleted successfully' });
    }
)

export default app;
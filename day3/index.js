const express = require('express');
const morgan = require('morgan');
const {
  listTodos,
  getTodoById,
  deleteTodoById,
  addTodo
} = require('./store');
const {
  validateTodoBody
} = require('./validate');


const app = express();
app.use(express.json());
app.use(morgan('dev')); // tiny, helpful request logs


function sendError(res, status, message, code) {
  return res.status(status).json({
    error: {
      message,
      code
    }
  });
}


app.get('/api/todos', async (req, res) => {
  const items = await listTodos();
  res.status(200).json({
    items,
    total: items.length
  });
});


app.get('/api/todos/:id', async (req, res) => {
  const todo = await getTodoById(req.params.id);
  if (!todo) return sendError(res, 404, 'Todo not found', 'NOT_FOUND');
  res.status(200).json(todo);
});


app.delete('/api/todos/:id', async (req, res) => {
  const removed = await deleteTodoById(req.params.id);
  if (!removed) return sendError(res, 404, 'Todo not found', 'NOT_FOUND');
  res.status(204).send();
});


// Bonus: create to test validation
app.post('/api/todos', validateTodoBody, async (req, res) => {
  const todo = await addTodo(req.body.title, req.body.completed);
  res.status(201).json(todo);
});


// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Something went wrong';
  res.status(status).json({
    error: {
      message,
      code
    }
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Todo API listening on http://localhost:${PORT}`);
});

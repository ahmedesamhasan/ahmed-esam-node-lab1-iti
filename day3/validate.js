function badRequest(res, message) {
  return res.status(400).json({
    error: {
      message,
      code: 'VALIDATION_ERROR'
    }
  });
}


function validateTodoBody(req, res, next) {
  const {
    title,
    completed
  } = req.body || {};
  if (typeof title !== 'string' || !title.trim()) return badRequest(res, 'Invalid title');
  if (title.trim().length > 200) return badRequest(res, 'Title must be ≤ 200 characters');
  if (completed !== undefined && typeof completed !== 'boolean') return badRequest(res, 'Invalid completed');
  req.body.title = title.trim();
  next();
}


module.exports = {
  validateTodoBody
};

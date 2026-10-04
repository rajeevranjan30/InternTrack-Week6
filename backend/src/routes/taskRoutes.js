const router = require('express').Router();
const auth = require('../middleware/auth');
const { validateTask, validateStatusQuery } = require('../middleware/validate');
const controller = require('../controllers/taskController');

router.use(auth);
router.route('/')
  .get(validateStatusQuery, controller.list)
  .post(validateTask, controller.create);

router.route('/:id')
  .get(controller.one)
  .patch(validateTask, controller.update)
  .delete(controller.remove);

module.exports = router;

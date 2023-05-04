const express = require("express");
const guard = require('../middlewares/guard');
const treeController = require('../controllers/treeController');
const router = express.Router();

router.route('/').post(guard, treeController.createTree).get(guard, treeController.getTrees);
router.route('/myTree').get(guard, treeController.getMyTree).post(guard, treeController.saveMyTree);
router.route('/:id')
    .get(guard, treeController.getTreeById)
    .patch(guard, treeController.updateTree)
    .delete(guard, treeController.deleteTree)
    .post(guard, treeController.joinToTree);

router.route('/exit/:id').delete(guard, treeController.exitFromTree);
module.exports = router;
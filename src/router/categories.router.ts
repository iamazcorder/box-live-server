import categoryController from '@/controller/categories.controller';
import Router from 'koa-router';

const categoryRouter = new Router({ prefix: '/category' });

// 获取分类列表
// categoryRouter.get('/list', categoryController.getList);

// 获取分级分类列表
categoryRouter.get('/list', categoryController.getNestedList);

// 获取指定分类
// categoryRouter.get('/:id', categoryController.find);

// 创建分类
// categoryRouter.post('/', categoryController.create);

// 删除分类
// categoryRouter.delete('/:id', categoryController.delete);

export default categoryRouter;

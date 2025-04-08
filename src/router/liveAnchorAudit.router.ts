import Router from 'koa-router';

import liveAnchorAuditController from '@/controller/liveAnchorAudit.controller';

const userRouter = new Router({ prefix: '/liveAnchorAudit' });

userRouter.post('/create', liveAnchorAuditController.create);

// 用户列表
userRouter.get('/list', liveAnchorAuditController.list);

// 获取用户信息
userRouter.get('/get_audit_info', liveAnchorAuditController.getAuditInfo);

// 更新用户信息
userRouter.put('/update', liveAnchorAuditController.update);

export default userRouter;

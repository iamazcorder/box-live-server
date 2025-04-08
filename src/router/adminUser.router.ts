import Router from 'koa-router';

import adminUserController from '@/controller/adminUser.controller';

const userRouter = new Router({ prefix: '/adminUser' });

userRouter.post('/create', adminUserController.create);

// 账号密码登录
userRouter.post('/login', adminUserController.login);

// 用户名密码登录
// userRouter.post('/username_login', verifyProp, userController.usernameLogin);

// 用户列表
userRouter.get('/list', adminUserController.list);

// 获取用户信息
userRouter.get('/get_user_info', adminUserController.getUserInfo);

// 查找用户
userRouter.get('/find/:id', adminUserController.find);

// 更新用户
// userRouter.put(
//   '/update/:id',
//   verifyProp,
//   apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
//   userController.update
// );

// 修改密码
// userRouter.put('/update_pwd', userController.updatePwd);

// 更新用户角色
// userRouter.put(
//   '/update_user_role/:id',
//   verifyProp,
//   apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
//   userController.updateUserRole
// );

// 上传头像
userRouter.post('/upload_avatar', adminUserController.uploadAvatar);

// 更新用户信息
userRouter.put('/update', adminUserController.update);

export default userRouter;

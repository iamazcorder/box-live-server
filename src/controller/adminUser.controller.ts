import { authJwt, signAdminJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import {
  COMMON_HTTP_CODE,
  COMMON_SUCCESS_MSG,
  MAX_TOKEN_EXP,
} from '@/constant';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import adminUserService from '@/service/adminUser.service';
import { IAdminUser } from '@/types/IAdminUser';
import * as crypto from 'crypto-js';
import fs from 'fs';
import { ParameterizedContext } from 'koa';
import path from 'path';
import authController from './auth.controller';

class AdminUserController {
  common = {
    list: (data) => adminUserService.getList(data),
    create: (data: IAdminUser) => adminUserService.create(data),
    isSameName: (username: string) => adminUserService.isSameName(username),
  };

  async getUserInfo(ctx: ParameterizedContext, next) {
    const { code, userInfo, msg } = await authJwt(ctx);
    console.log(code, userInfo, msg, '00000');
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(msg, code, code);
    }
    const [auths, result] = await Promise.all([
      authController.common.getUserAuth(userInfo.id!),
      adminUserService.getUserInfo(userInfo.id!),
    ]);
    // 获取纯净的对象，避免循环引用
    successHandler({ ctx, data: { ...result?.get({ plain: true }), auths } });
    await next();
  }

  /** 管理员登录 */
  login = async (ctx: ParameterizedContext, next) => {
    const { username, password } = ctx.request.body;
    let { exp } = ctx.request.body;

    if (!exp) exp = 24;
    else if (exp > MAX_TOKEN_EXP) exp = MAX_TOKEN_EXP;

    const admin = await adminUserService.login({ username, password });
    const token = signAdminJwt({
      adminInfo: {
        id: admin.id,
        username: admin.username,
        avatar: admin.avatar,
      },
      exp,
    });

    await adminUserService.updateByUsername({ username, token });

    successHandler({
      ctx,
      data: token,
      msg: COMMON_SUCCESS_MSG.loginSuccess,
    });
    await next();
  };

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await adminUserService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  /** 获取管理员列表 */
  list = async (ctx: ParameterizedContext, next) => {
    const {
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
      status,
    }: IList<IAdminUser> = ctx.request.query;

    const result = await this.common.list({
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
      status,
    });

    successHandler({ ctx, data: result });
    await next();
  };

  /** 创建管理员 */
  create = async (ctx: ParameterizedContext, next) => {
    const data: IAdminUser = ctx.request.body;
    const { username, password } = data;

    if (!username || !password) {
      throw new CustomError(
        '用户名或密码不能为空',
        COMMON_HTTP_CODE.paramsError
      );
    }

    if (username.length < 3 || username.length > 16) {
      throw new CustomError(
        '用户名长度需在3-16位之间',
        COMMON_HTTP_CODE.paramsError
      );
    }

    if (password.length < 6 || password.length > 18) {
      throw new CustomError(
        '密码长度需在6-18位之间',
        COMMON_HTTP_CODE.paramsError
      );
    }

    const result = await this.common.create(data);
    successHandler({ ctx, data: result });
    await next();
  };

  /** 更新管理员信息 */
  update = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const { username, status, avatar }: IAdminUser = ctx.request.body;

    if (!username) {
      throw new CustomError('用户名不能为空', COMMON_HTTP_CODE.paramsError);
    }

    const result = await adminUserService.update({
      id,
      username,
      status,
      avatar,
    });
    successHandler({ ctx, data: result });
    await next();
  };

  /** 删除管理员 */
  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    await adminUserService.delete(id);
    successHandler({ ctx, msg: '管理员删除成功' });
    await next();
  };

  /** 修改密码 */
  updatePwd = async (ctx: ParameterizedContext, next) => {
    const { id, oldPassword, newPassword } = ctx.request.body;

    if (!oldPassword || !newPassword) {
      throw new CustomError(
        '旧密码和新密码不能为空',
        COMMON_HTTP_CODE.paramsError
      );
    }

    // 验证旧密码
    const admin = await adminUserService.findPwd(id);
    const isValid = await require('bcryptjs').compare(
      oldPassword,
      admin?.password || ''
    );

    if (!isValid) {
      throw new CustomError('旧密码错误', COMMON_HTTP_CODE.paramsError);
    }

    await adminUserService.updatePwd({ id, password: newPassword });
    successHandler({ ctx, msg: '密码修改成功' });
    await next();
  };

  async uploadAvatar(ctx: ParameterizedContext, next: () => Promise<any>) {
    try {
      // 获取上传的文件（koa-body 会把文件放到 ctx.request.files 下）
      const files = ctx.request.files?.avatar; // 可能是单个文件或文件数组
      const { id } = ctx.request.body; // 获取 id 字段，假设是通过表单传递的

      if (!files || !id) {
        throw new CustomError('缺少文件或用户ID！', 400, 400);
      }

      // 如果上传的是一个文件数组，则取第一个文件
      const file = Array.isArray(files) ? files[0] : files;

      // 获取文件路径
      const uploadDir = path.join(__dirname, '../../public/img');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 计算文件的哈希值（使用 crypto-js）
      const fileBuffer = await fs.promises.readFile(file.filepath);

      // 使用 Buffer 转为 Base64 字符串后，再将其转换为 WordArray
      const fileBase64 = fileBuffer.toString('base64');
      const fileWordArray = crypto.enc.Base64.parse(fileBase64); // 转换为 crypto-js 中的 WordArray

      // 判断文件哈希值是否已存在（假设每个文件名是唯一的）
      const filesInDir = await fs.promises.readdir(uploadDir);
      let duplicateFile: string | null = null;

      for (const existingFileName of filesInDir) {
        const existingFilePath = path.join(uploadDir, existingFileName);
        const existingFileBuffer = fs.readFileSync(existingFilePath);

        // 使用相同的转换方式计算现有文件的哈希值
        const existingFileBase64 = existingFileBuffer.toString('base64');
        const existingFileWordArray =
          crypto.enc.Base64.parse(existingFileBase64);

        // 计算现有文件的哈希值
        const existingFileHash = crypto
          .MD5(existingFileWordArray)
          .toString(crypto.enc.Base64);

        if (
          existingFileHash ===
          crypto.MD5(fileWordArray).toString(crypto.enc.Base64)
        ) {
          duplicateFile = existingFileName; // 如果哈希值相同，则找到了重复的文件
          break;
        }
      }

      // 如果找到了重复文件，直接使用该文件的 URL 更新用户头像
      if (duplicateFile) {
        const avatarUrl = `http://localhost:8080/img/${duplicateFile}`;
        await adminUserService.updateAvatar(id, avatarUrl); // 更新数据库中的头像 URL
        successHandler({ ctx, data: { avatarUrl }, msg: '头像上传成功！' });
      } else {
        // 否则，保存上传的文件并更新头像 URL
        const filePath = path.join(uploadDir, file.newFilename);
        await fs.promises.rename(file.filepath, filePath); // 移动文件到目标目录

        // 生成头像的 URL
        const avatarUrl = `http://localhost:8080/img/${file.newFilename}`;
        await adminUserService.updateAvatar(id, avatarUrl); // 更新数据库中的头像 URL
        successHandler({ ctx, data: { avatarUrl }, msg: '头像上传成功！' });
      }

      await next();
    } catch (error: any) {
      // 错误处理
      console.error('上传头像失败:', error.message);

      // 如果上传过程中出现错误，清理已上传的文件
      const files = ctx.request.files?.avatar;
      if (files) {
        const file = Array.isArray(files) ? files[0] : files;
        const filePath = path.join(
          __dirname,
          '../../public/img',
          file.newFilename
        );
        await fs.promises.unlink(filePath); // 删除已上传的文件
      }

      throw new CustomError('头像上传失败！' + error.message, 500, 500);
    }
  }

  /** 恢复管理员账号 */
  restore = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    await adminUserService.restore(id);
    successHandler({ ctx, msg: '账号恢复成功' });
    await next();
  };
}

export default new AdminUserController();

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import { IPreview } from '@/model/live_room_previews.model';
import liveRoomPreviewsService from '@/service/live_room_previews.service';
import * as crypto from 'crypto-js';
import fs from 'fs';
import { ParameterizedContext } from 'koa';
import path from 'path';

class LiveRoomPreviewsController {
  common = {
    /** 获取直播预告列表 */
    getList: async (data) => {
      const {
        id,
        user_id,
        title,
        preview_date,
        orderBy,
        orderName,
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      }: IList<IPreview> = data;
      const result = await liveRoomPreviewsService.getList({
        id,
        user_id,
        title,
        preview_date,
        nowPage,
        pageSize,
        orderBy,
        orderName,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      });
      return result;
    },
    /** 检查直播预告是否存在 */
    isExist: async (ids: number[]) => {
      const isExist = await liveRoomPreviewsService.isExist(ids);
      if (!isExist) {
        throw new CustomError(
          `不存在id为${ids.join()}的直播预告！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
    },
    /** 删除直播预告 */
    delete: async (id: number, isRoute?: boolean) => {
      const isExist = await liveRoomPreviewsService.isExist([id]);
      if (!isExist) {
        if (isRoute) {
          throw new CustomError(
            `不存在id为${id}的直播预告！`,
            COMMON_HTTP_CODE.paramsError,
            COMMON_HTTP_CODE.paramsError
          );
        }
      } else {
        await liveRoomPreviewsService.delete(id);
      }
    },
  };

  /** 获取直播预告列表 */
  getList = async (ctx: ParameterizedContext, next) => {
    const {
      userId,
      page = 1,
      size = 10,
      title,
      preview_date,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    } = ctx.request.query;

    // 默认分页参数
    const nowPage = Number(page);
    const pageSize = Number(size);

    const result = await this.common.getList({
      user_id: userId ? Number(userId) : undefined, // 过滤条件
      title,
      preview_date,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });
    await next();
  };

  /** 查找指定直播预告 */
  find = async (ctx: ParameterizedContext, next) => {
    // 获取查询参数中的 id
    const { id } = ctx.request.query;
    if (!id) {
      throw new CustomError(
        '缺少 id 参数！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    const result = await liveRoomPreviewsService.find(Number(id));
    successHandler({ ctx, data: result });
    await next();
  };

  /** 创建直播预告 */
  create = async (ctx: ParameterizedContext, next) => {
    const { user_id, title, preview_date, cover_image }: IPreview =
      ctx.request.body;
    try {
      // 获取上传的文件（koa-body 会把文件放到 ctx.request.files 下）
      const files = ctx.request.files?.cover; // 可能是单个文件或文件数组
      // const { id } = ctx.request.body; // 获取 id 字段，假设是通过表单传递的

      if (!files || !user_id) {
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
        const coverUrl = `http://localhost:8080/img/${duplicateFile}`;
        await liveRoomPreviewsService.create({
          user_id,
          title,
          preview_date,
          cover_image: coverUrl,
        });
        successHandler({ ctx, data: { coverUrl }, msg: '封面上传成功！' });
      } else {
        // 否则，保存上传的文件并更新头像 URL
        const filePath = path.join(uploadDir, file.newFilename);
        await fs.promises.rename(file.filepath, filePath); // 移动文件到目标目录

        // 生成头像的 URL
        const coverUrl = `http://localhost:8080/img/${file.newFilename}`;
        await liveRoomPreviewsService.create({
          user_id,
          title,
          preview_date,
          cover_image: coverUrl,
        });
        successHandler({ ctx, data: { coverUrl }, msg: '封面上传成功！' });
      }

      await next();
    } catch (error: any) {
      // 错误处理
      console.error('上传封面失败:', error.message);

      // 如果上传过程中出现错误，清理已上传的文件
      const files = ctx.request.files?.cover;
      if (files) {
        const file = Array.isArray(files) ? files[0] : files;
        const filePath = path.join(
          __dirname,
          '../../public/img',
          file.newFilename
        );
        await fs.promises.unlink(filePath); // 删除已上传的文件
      }

      throw new CustomError('封面上传失败！' + error.message, 500, 500);
    }
    // await liveRoomPreviewsService.create({ user_id, title, preview_date, cover_image });
    // successHandler({ ctx });
    // await next();
  };

  /** 删除直播预告 */
  // delete = async (ctx: ParameterizedContext, next) => {
  //     const { id } = ctx.request.body;  // 从请求体中获取 id

  //     if (!id) {
  //         throw new CustomError('缺少 id 参数！', COMMON_HTTP_CODE.paramsError, COMMON_HTTP_CODE.paramsError);
  //     }

  //     await this.common.delete(Number(id), true);  // 调用公共删除方法
  //     successHandler({ ctx });
  //     await next();
  // };
  /** 删除直播预告（批量） */
  delete = async (ctx: ParameterizedContext, next) => {
    const { ids }: { ids: number[] } = ctx.request.body; // 从请求体中获取 ids 数组

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new CustomError(
        '缺少 ids 参数或参数格式错误！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    // 检查每个 ID 是否存在
    await this.common.isExist(ids);

    // 执行批量删除
    await liveRoomPreviewsService.deleteBatch(ids); // 假设你已经在 service 中实现了批量删除的逻辑

    successHandler({ ctx });
    await next();
  };
}

export default new LiveRoomPreviewsController();

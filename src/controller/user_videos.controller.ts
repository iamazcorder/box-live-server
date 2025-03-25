import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import userVideosService from '@/service/user_videos.service';
import * as crypto from 'crypto-js';
import fs from 'fs';
import { ParameterizedContext } from 'koa';
import path from 'path';

class UserVideosController {
  /** 获取用户视频列表 */
  list = async (ctx: ParameterizedContext, next) => {
    const {
      id,
      user_id,
      live_room_id,
      parent_category_id,
      child_category_id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<any> = ctx.request.query;

    const result = await userVideosService.getList({
      id,
      user_id,
      live_room_id,
      parent_category_id,
      child_category_id,
      orderBy,
      orderName,
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

  /** 获取单个视频 */
  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await userVideosService.find(id);
    if (!result) {
      throw new CustomError(
        `ID 为 ${id} 的视频不存在！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    successHandler({ ctx, data: result });
    await next();
  };

  /** 创建视频 */
  /** 创建用户视频 */
  async create(ctx: ParameterizedContext, next: () => Promise<any>) {
    try {
      // 获取请求参数
      const {
        user_id,
        live_room_id,
        title,
        parent_category_id,
        child_category_id,
        url,
        duration,
        desc,
      } = ctx.request.body;

      if (
        !user_id ||
        !live_room_id ||
        !title ||
        !parent_category_id ||
        !child_category_id ||
        !url ||
        !duration ||
        !desc
      ) {
        throw new CustomError(
          '所有字段均不能为空！',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }

      // 处理封面上传
      let coverUrl = '';
      const coverFile = ctx.request.files?.cover;

      if (coverFile) {
        const file = Array.isArray(coverFile) ? coverFile[0] : coverFile;
        const uploadDir = path.join(__dirname, '../../public/img');

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 计算文件哈希值
        const fileBuffer = await fs.promises.readFile(file.filepath);
        const fileBase64 = fileBuffer.toString('base64');
        const fileWordArray = crypto.enc.Base64.parse(fileBase64);
        const fileHash = crypto.MD5(fileWordArray).toString(crypto.enc.Base64);

        // 检查是否存在相同的封面
        const filesInDir = await fs.promises.readdir(uploadDir);
        let duplicateFile: string | null = null;

        for (const existingFileName of filesInDir) {
          const existingFilePath = path.join(uploadDir, existingFileName);
          const existingFileBuffer = fs.readFileSync(existingFilePath);
          const existingFileBase64 = existingFileBuffer.toString('base64');
          const existingFileWordArray =
            crypto.enc.Base64.parse(existingFileBase64);
          const existingFileHash = crypto
            .MD5(existingFileWordArray)
            .toString(crypto.enc.Base64);

          if (existingFileHash === fileHash) {
            duplicateFile = existingFileName;
            break;
          }
        }

        // 使用已有封面或保存新封面
        if (duplicateFile) {
          coverUrl = `http://localhost:8080/img/${duplicateFile}`;
        } else {
          const filePath = path.join(uploadDir, file.newFilename);
          await fs.promises.rename(file.filepath, filePath);
          coverUrl = `http://localhost:8080/img/${file.newFilename}`;
        }
      }

      // 存入数据库
      const result = await userVideosService.create({
        user_id,
        live_room_id,
        title,
        parent_category_id,
        child_category_id,
        cover: coverUrl,
        url,
        duration,
        desc,
      });

      successHandler({ ctx, data: result, msg: '视频创建成功！' });

      await next();
    } catch (error: any) {
      console.error('创建视频失败:', error.message);
      throw new CustomError('创建视频失败！' + error.message, 500, 500);
    }
  }
  /** 更新视频 */
  update = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const { title, cover, url, desc, parent_category_id, child_category_id } =
      ctx.request.body;

    if (!title && !cover && !url) {
      throw new CustomError(
        '至少需要更新标题、封面或视频URL！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    const isExist = await userVideosService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在 ID 为 ${id} 的视频！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    await userVideosService.update({
      id,
      title,
      cover,
      url,
      desc,
      parent_category_id,
      child_category_id,
    });

    successHandler({ ctx, msg: '视频更新成功！' });
    await next();
  };

  /** 软删除视频 */
  softDelete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;

    const isExist = await userVideosService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在 ID 为 ${id} 的视频！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    await userVideosService.softDelete(id);

    successHandler({ ctx, msg: '视频已删除（软删除）！' });
    await next();
  };

  /** 硬删除视频 */
  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.request.body.id;

    const isExist = await userVideosService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在 ID 为 ${id} 的视频！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    await userVideosService.delete(id);

    successHandler({ ctx, msg: '视频已永久删除！' });
    await next();
  };
}

export default new UserVideosController();

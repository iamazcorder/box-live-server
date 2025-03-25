import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveRoomRecordingService from '@/service/live_room_recordings.service';
import * as crypto from 'crypto-js';
import fs from 'fs';
import { ParameterizedContext } from 'koa';
import path from 'path';

class LiveRoomRecordingController {
  /** 检查回放是否存在 */
  isExist = async (ids: number[]) => {
    return await liveRoomRecordingService.isExist(ids);
  };

  /** 获取直播回放列表 */
  list = async (ctx: ParameterizedContext, next) => {
    // @ts-ignore
    const {
      id,
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

    const result = await liveRoomRecordingService.getList({
      id,
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

  /** 根据 ID 查询直播回放 */
  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await liveRoomRecordingService.find(id);
    if (!result) {
      throw new CustomError(
        `ID 为 ${id} 的回放不存在！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    successHandler({ ctx, data: result });
    await next();
  };

  /** 创建直播回放（支持视频文件上传） */
  create = async (ctx: ParameterizedContext, next) => {
    try {
      const {
        live_room_id,
        parent_category_id,
        child_category_id,
        title,
        duration,
      } = ctx.request.body;
      const files = ctx.request.files?.video; // 获取上传的视频文件

      if (
        !live_room_id ||
        !parent_category_id ||
        !child_category_id ||
        !title
      ) {
        throw new CustomError(
          '直播间ID、父分区ID、子分区ID和标题不能为空！',
          400,
          400
        );
      }

      if (!files) {
        throw new CustomError('未收到视频文件！', 400, 400);
      }

      // 如果上传的是一个文件数组，则取第一个文件
      const file = Array.isArray(files) ? files[0] : files;

      // 视频存储目录
      const uploadDir = path.join(__dirname, '../../public/videos');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 计算文件哈希值（MD5），避免重复上传
      const fileBuffer = await fs.promises.readFile(file.filepath);
      const fileBase64 = fileBuffer.toString('base64');
      const fileWordArray = crypto.enc.Base64.parse(fileBase64);
      const fileHash = crypto.MD5(fileWordArray).toString(crypto.enc.Base64);

      // 检查是否已存在相同哈希值的视频文件
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
          duplicateFile = existingFileName; // 找到相同的视频文件
          break;
        }
      }

      let videoUrl: string;

      if (duplicateFile) {
        // 如果找到重复文件，直接使用其 URL
        videoUrl = `http://localhost:8080/videos/${duplicateFile}`;
      } else {
        // 否则存储新文件
        const newFileName = `${Date.now()}_${file.newFilename}`;
        const filePath = path.join(uploadDir, newFileName);
        await fs.promises.rename(file.filepath, filePath);

        // 生成视频访问 URL
        videoUrl = `http://localhost:8080/videos/${newFileName}`;
      }

      // 将视频 URL 存入数据库
      const result = await liveRoomRecordingService.create({
        live_room_id,
        parent_category_id,
        child_category_id,
        title,
        url: videoUrl, // 存储视频访问链接
        duration,
      });

      successHandler({ ctx, data: result, msg: '直播回放创建成功！' });
      await next();
    } catch (error: any) {
      console.error('创建直播回放失败:', error.message);

      // 清理上传失败的文件
      const files = ctx.request.files?.video;
      if (files) {
        const file = Array.isArray(files) ? files[0] : files;
        const filePath = path.join(
          __dirname,
          '../../public/videos',
          file.newFilename
        );
        await fs.promises.unlink(filePath).catch(() => {});
      }

      throw new CustomError('直播回放创建失败！' + error.message, 500, 500);
    }
  };

  /** 更新直播回放 */
  update = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const { title, url } = ctx.request.body;

    if (!title && !url) {
      throw new CustomError(
        '至少需要更新标题或URL！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    const isExist = await liveRoomRecordingService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在 ID 为 ${id} 的直播回放！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    await liveRoomRecordingService.update({ id, title, url });

    successHandler({ ctx, msg: '更新成功！' });
    await next();
  };

  /** 软删除直播回放 */
  softDelete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;

    const isExist = await liveRoomRecordingService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在 ID 为 ${id} 的直播回放！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    await liveRoomRecordingService.softDelete(id);

    successHandler({ ctx, msg: '回放已删除（软删除）！' });
    await next();
  };

  /** 硬删除直播回放（包含物理删除文件） */
  delete = async (ctx: ParameterizedContext, next) => {
    // 从 `query` 解析 `id`
    const id = Number(ctx.request.body.id);

    // 校验 `id`
    if (!id || isNaN(id)) {
      throw new CustomError(
        '缺少或无效的 ID 参数！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    // 查询该回放是否存在
    const recording = await liveRoomRecordingService.find(id);
    if (!recording) {
      throw new CustomError(
        `不存在 ID 为 ${id} 的直播回放！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    // 获取视频 URL
    // const videoUrl = recording.url;
    // if (videoUrl) {
    //     try {
    //         // 提取视频文件名
    //         const fileName = path.basename(videoUrl);
    //         const filePath = path.join(__dirname, '../../public/videos', fileName);

    //         // 检查文件是否存在
    //         if (fs.existsSync(filePath)) {
    //             // 删除视频文件
    //             await fs.promises.unlink(filePath);
    //             console.log(`✅ 成功删除视频文件: ${filePath}`);
    //         } else {
    //             console.warn(`⚠️ 找不到视频文件: ${filePath}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ 删除视频文件失败:', error);
    //     }
    // }

    // 删除数据库记录
    await liveRoomRecordingService.delete(id);

    successHandler({ ctx, msg: '🎉 回放已永久删除！' });
    await next();
  };
}

export default new LiveRoomRecordingController();

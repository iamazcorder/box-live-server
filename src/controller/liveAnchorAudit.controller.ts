import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveAnchorAuditService from '@/service/liveAnchorAudit.service';
import { IAdminUser } from '@/types/IAdminUser';
import { ILiveAnchorAudit } from '@/types/IUser';
import { ParameterizedContext } from 'koa';

class AdminUserController {
  common = {
    list: (data) => liveAnchorAuditService.getList(data),
    create: (data: IAdminUser) => liveAnchorAuditService.create(data),
    // isSameName: (username: string) => adminUserService.isSameName(username),
  };

  async getAuditInfo(ctx: ParameterizedContext, next) {
    const user_id = parseInt(ctx.query.user_id as string, 10);
    const result = await liveAnchorAuditService.getAuditInfo(user_id);
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
    const data: ILiveAnchorAudit = ctx.request.body;
    const { real_name, id_number } = data;

    if (!real_name || !id_number) {
      throw new CustomError(
        '姓名或身份证号不能为空',
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
    const updateInfo: ILiveAnchorAudit = ctx.request.body;

    const result = await liveAnchorAuditService.update({
      id,
      ...updateInfo,
    });
    successHandler({ ctx, data: result });
    await next();
  };

  /** 删除管理员 */
  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    await liveAnchorAuditService.delete(id);
    successHandler({ ctx, msg: '管理员删除成功' });
    await next();
  };

  /** 恢复管理员账号 */
  restore = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    await liveAnchorAuditService.restore(id);
    successHandler({ ctx, msg: '账号恢复成功' });
    await next();
  };
}

export default new AdminUserController();

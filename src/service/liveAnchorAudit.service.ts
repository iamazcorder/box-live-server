import { deleteUseLessObjectKey } from 'billd-utils';
import { Op } from 'sequelize';

import { COMMON_HTTP_CODE } from '@/constant';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveAnchorAuditModel from '@/model/liveAnchorAudit.model';
import { IAdminUser } from '@/types/IAdminUser';
import { ILiveAnchorAudit } from '@/types/IUser';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class AdminUserService {
  /** 审核记录是否存在 */
  async isExist(ids: number[]) {
    const res = await liveAnchorAuditModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取单条审核记录信息 */
  async getAuditInfo(user_id: number) {
    const result = await liveAnchorAuditModel.findOne({
      where: { user_id },
    });
    return result;
  }

  /** 获取审核记录列表 */
  async getList({
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
  }: IList<IAdminUser>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      status,
    });

    // 关键字搜索
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['id_number'],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }

    // 时间范围筛选
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }

    // 排序
    const orderRes = handleOrder({ orderName, orderBy });

    const result = await liveAnchorAuditModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
      paranoid: false, // 包含软删除记录
    });

    return handlePaging(result, nowPage, pageSize);
  }

  /** 根据id修改审核记录状态 */
  async update({ id, status }: any) {
    if (id) {
      const result = await liveAnchorAuditModel.update(
        {
          status,
        },
        { where: { id }, limit: 1 }
      );
      return result;
    }
  }

  /** 创建审核记录 */
  async create(data: ILiveAnchorAudit) {
    // 检查审核记录是否已存在
    // if (data.user_id) {
    //   throw new CustomError(
    //     `用户名审核记录已存在`,
    //     COMMON_HTTP_CODE.paramsError,
    //     COMMON_HTTP_CODE.paramsError
    //   );
    // }

    // 密码加密
    // const hashedPwd = await require('bcryptjs').hash(data.password, 10);
    const result = await liveAnchorAuditModel.create({
      ...data,
      // password: hashedPwd,
    });

    // 返回时排除密码字段
    // const returnData = result.toJSON();
    // delete returnData.password;
    return result;
  }

  /** 删除审核记录 */
  async delete(id: number) {
    const result = await liveAnchorAuditModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }

  /** 恢复被软删除的审核记录 */
  async restore(id: number) {
    const result = await liveAnchorAuditModel.restore({
      where: { id },
    });
    return result;
  }
}

export default new AdminUserService();

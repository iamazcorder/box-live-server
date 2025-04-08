import { deleteUseLessObjectKey } from 'billd-utils';
import { Op } from 'sequelize';

import { COMMON_HTTP_CODE } from '@/constant';
import { IList } from '@/interface';
import adminUserModel from '@/model/adminUser.model';
import { CustomError } from '@/model/customError.model';
import { IAdminUser } from '@/types/IAdminUser';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class AdminUserService {
  /** 管理员是否存在 */
  async isExist(ids: number[]) {
    const res = await adminUserModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取用户信息 */
  async getUserInfo(id: number) {
    const result = await adminUserModel.findOne({
      attributes: {
        exclude: ['password'],
        include: [
          // [
          //   literal(
          //     `(select count(*) from comment where from_user_id = ${id})`
          //   ),
          //   'comment_total',
          // ],
          // [
          //   literal(`(select count(*) from star where to_user_id = ${id})`),
          //   'receive_star_total',
          // ],
        ],
      },
      where: { id },
    });
    return result;
  }

  /** 管理员登录 */
  async login({ username, password }: IAdminUser) {
    const admin = await adminUserModel.findOne({
      where: { username },
    });

    if (!admin) {
      throw new CustomError(
        '管理员账号不存在',
        COMMON_HTTP_CODE.notFound,
        COMMON_HTTP_CODE.notFound
      );
    }

    if (admin.status === 0) {
      throw new CustomError(
        '账号已被禁用',
        COMMON_HTTP_CODE.forbidden,
        COMMON_HTTP_CODE.forbidden
      );
    }

    // const isValid = await require('bcryptjs').compare(password, admin.password);
    const isValid = password === admin.password;

    if (!isValid) {
      throw new CustomError(
        '密码错误',
        COMMON_HTTP_CODE.unauthorized,
        COMMON_HTTP_CODE.unauthorized
      );
    }

    // 返回时排除密码字段
    const result = admin.toJSON();
    delete result.password;
    return result;
  }

  /** 根据id查找用户（不返回password，但返回token） */
  async findAndToken(id: number) {
    const result = await adminUserModel.findOne({
      // include: [
      //   {
      //     model: roleModel,
      //     through: { attributes: [] },
      //   },
      // ],
      attributes: {
        exclude: ['password'],
      },
      where: { id },
    });
    return result;
  }

  /** 获取管理员列表 */
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
      arr: ['username'],
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

    const result = await adminUserModel.findAndCountAll({
      attributes: {
        exclude: ['password'], // 始终排除密码字段
      },
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

  /** 根据id查找管理员 */
  async find(id: number) {
    const result = await adminUserModel.findOne({
      attributes: {
        exclude: ['password'],
      },
      where: { id },
      paranoid: false,
    });
    return result;
  }

  /** 根据id查找管理员密码 */
  async findPwd(id: number) {
    const result = await adminUserModel.findOne({
      where: { id },
      attributes: ['password'],
    });
    return result;
  }

  /** 根据id修改管理员密码 */
  async updatePwd({ id, password }: IAdminUser) {
    // 密码加密
    const hashedPwd = await require('bcryptjs').hash(password, 10);
    const result = await adminUserModel.update(
      { password: hashedPwd },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 是否同名 */
  async isSameName(username: string, excludeId?: number) {
    const where: any = {
      username,
    };
    if (excludeId) {
      where.id = {
        [Op.ne]: excludeId,
      };
    }
    const result = await adminUserModel.findOne({
      attributes: ['id'],
      where,
      paranoid: false,
    });
    return !!result;
  }

  /** 根据id修改管理员 */
  async update({ id, username, status, avatar }: IAdminUser) {
    // 检查用户名是否已被占用
    if (username && (await this.isSameName(username, id))) {
      throw new CustomError(
        `用户名 ${username} 已被占用`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    const result = await adminUserModel.update(
      {
        username,
        status,
        avatar,
      },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 根据username修改管理员 */
  async updateByUsername({ username, status, avatar, token }: IAdminUser) {
    if (username) {
      const result = await adminUserModel.update(
        {
          status,
          avatar,
          token,
        },
        { where: { username }, limit: 1 }
      );
      return result;
    }
    return;
  }

  /** 创建管理员 */
  async create(data: IAdminUser) {
    // 检查用户名是否已存在
    if (data.username && (await this.isSameName(data.username))) {
      throw new CustomError(
        `用户名 ${data.username} 已存在`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    // 密码加密
    const hashedPwd = await require('bcryptjs').hash(data.password, 10);
    const result = await adminUserModel.create({
      ...data,
      password: hashedPwd,
    });

    // 返回时排除密码字段
    const returnData = result.toJSON();
    delete returnData.password;
    return returnData;
  }

  /** 删除管理员 */
  async delete(id: number) {
    // 禁止删除自己
    if (id === 1) {
      throw new CustomError(
        '不能删除超级管理员',
        COMMON_HTTP_CODE.forbidden,
        COMMON_HTTP_CODE.forbidden
      );
    }

    const result = await adminUserModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }

  /** 恢复被软删除的管理员 */
  async restore(id: number) {
    const result = await adminUserModel.restore({
      where: { id },
    });
    return result;
  }

  /** 更新管理员头像 */
  async updateAvatar(id: number, avatarUrl: string) {
    const result = await adminUserModel.update(
      { avatar: avatarUrl },
      { where: { id }, limit: 1 }
    );
    return result;
  }
}

export default new AdminUserService();

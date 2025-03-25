import sequelize from '@/config/mysql';
import userSearchHistoryModel from '@/model/user_search_history.model';
import { handlePage, handlePaging, handleRangTime } from '@/utils';
import { deleteUseLessObjectKey } from 'billd-utils';

class UserSearchHistoryService {
  /** 记录用户搜索历史 */
  async create({
    user_id,
    search_keyword,
  }: {
    user_id: number;
    search_keyword: string;
  }) {
    const result = await userSearchHistoryModel.create({
      user_id,
      search_keyword,
    });
    return result;
  }

  /** 获取用户搜索历史列表（去重 & 按 `created_at` 降序） */
  async getList({
    user_id,
    nowPage,
    pageSize,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: any) {
    const { offset, limit } = handlePage({ nowPage, pageSize });

    const allWhere: any = deleteUseLessObjectKey({ user_id });

    // 处理时间范围
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }

    const result = await userSearchHistoryModel.findAndCountAll({
      where: {
        ...allWhere,
        deleted_at: null, // 仅查询未软删除的记录
      },
      attributes: [
        [sequelize.fn('MAX', sequelize.col('id')), 'id'], // 获取最新的 `id`
        'user_id',
        'search_keyword',
        [sequelize.fn('MAX', sequelize.col('created_at')), 'created_at'], // 获取最新的 `created_at`
        [sequelize.fn('MAX', sequelize.col('updated_at')), 'updated_at'], // 获取最新的 `updated_at`
      ],
      group: ['user_id', 'search_keyword'], // **按用户和关键词去重**
      order: [[sequelize.fn('MAX', sequelize.col('created_at')), 'DESC']], // **按最新搜索时间排序**
      limit,
      offset,
    });

    return handlePaging(result, nowPage, pageSize);
  }

  /** 软删除用户搜索历史（标记删除） */
  async softDelete(id: number) {
    const result = await userSearchHistoryModel.update(
      { deleted_at: new Date() },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 清空用户的搜索历史（软删除所有） */
  async clearHistory(user_id: number) {
    const result = await userSearchHistoryModel.update(
      { deleted_at: new Date() },
      { where: { user_id } }
    );
    return result;
  }

  /** 硬删除用户搜索历史（彻底删除） */
  async delete(id: number) {
    const result = await userSearchHistoryModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new UserSearchHistoryService();

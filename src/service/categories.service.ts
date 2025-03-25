// import { ICategory } from '@/interface';
import { IList } from '@/interface';
import categoryModel, { ICategory } from '@/model/categories.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';
import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

class CategoryService {
  /** 检查分类是否存在 */
  async isExist(ids: number[]) {
    const res = await categoryModel.count({
      where: { id: { [Op.in]: ids } },
    });
    return res === ids.length;
  }

  /** 获取分类列表 */
  async getList({
    id,
    name,
    parent_id,
    level,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ICategory>) {
    // 确保 id 是有效数字，避免 NaN 进入 SQL
    // id = isNaN(Number(id)) ? undefined : Number(id);

    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['name', 'parent_id', 'level'],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }
    const orderRes = handleOrder({ orderName, orderBy });
    const result = await categoryModel.findAndCountAll({
      distinct: true,
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取分级分类列表 */
  async getNestedList() {
    const categories = await categoryModel.findAll();

    // 将分类数据转换为树状结构
    const categoryMap = new Map();
    categories.forEach((category) =>
      categoryMap.set(category.id, { ...category.get(), children: [] })
    );

    const nestedCategories: ICategory[] = [];
    categoryMap.forEach((category) => {
      if (category.parent_id) {
        categoryMap.get(category.parent_id)?.children.push(category);
      } else {
        nestedCategories.push(category);
      }
    });

    return nestedCategories;
  }

  /** 查找分类 */
  async find(id: number) {
    return await categoryModel.findOne({ where: { id } });
  }

  /** 创建分类 */
  async create(data: ICategory) {
    const result = await categoryModel.create(data);
    return result;
  }

  /** 更新分类 */
  async update(data: {
    id: number;
    name?: string;
    parent_id?: number;
    level?: number;
  }) {
    const { id } = data;
    const dataToUpdate = filterObj(data, ['id']);
    return await categoryModel.update(dataToUpdate, {
      where: { id },
      limit: 1,
    });
  }

  /** 删除分类 */
  async delete(id: number) {
    return await categoryModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
  }
}

export default new CategoryService();

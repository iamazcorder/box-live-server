import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList } from '@/interface';
import { ICategory } from '@/model/categories.model';
import { CustomError } from '@/model/customError.model';
import categoryService from '@/service/categories.service';
import { ParameterizedContext } from 'koa';

class CategoryController {
  common = {
    /** 获取分类列表 */
    getList: async (data) => {
      const {
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
      }: IList<ICategory> = data;
      const result = await categoryService.getList({
        id,
        name,
        parent_id,
        level,
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
    /** 检查分类是否存在 */
    isExist: async (ids: number[]) => {
      const isExist = await categoryService.isExist(ids);
      if (!isExist) {
        throw new CustomError(
          `不存在id为${ids.join()}的分类！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
    },
    /** 删除分类 */
    delete: async (id: number, isRoute?: boolean) => {
      const isExist = await categoryService.isExist([id]);
      if (!isExist) {
        if (isRoute) {
          throw new CustomError(
            `不存在id为${id}的分类！`,
            COMMON_HTTP_CODE.paramsError,
            COMMON_HTTP_CODE.paramsError
          );
        }
      } else {
        await categoryService.delete(id);
      }
    },
  };

  /** 获取分类列表 */
  getList = async (ctx: ParameterizedContext, next) => {
    const result = await this.common.getList(ctx.request.query);
    successHandler({ ctx, data: result });
    await next();
  };

  /** 获取分级分类列表 */
  getNestedList = async (ctx: ParameterizedContext, next) => {
    const result = await categoryService.getNestedList();
    successHandler({ ctx, data: result });
    await next();
  };

  /** 查找指定分类 */
  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await categoryService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  /** 创建分类 */
  async create(ctx: ParameterizedContext, next) {
    // const { name, remark, priority }: IArea = ctx.request.body;
    // await areaService.create({
    //   name,
    //   remark,
    //   priority,
    // });
    // successHandler({ ctx });

    // await next();
    const { name, parent_id, level }: ICategory = ctx.request.body;
    await categoryService.create({ name, parent_id, level });
    successHandler({ ctx });
    await next();
  }

  /** 删除分类 */
  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    await this.common.delete(id, true);
    successHandler({ ctx });
    await next();
  };
}

export default new CategoryController();

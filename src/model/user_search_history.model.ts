import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

export interface ISearchHistory {
  id?: number;
  user_id?: number;
  search_keyword?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

interface UserSearchHistoryModel
  extends Model<
      InferAttributes<UserSearchHistoryModel>,
      InferCreationAttributes<UserSearchHistoryModel>
    >,
    ISearchHistory {}

const model = sequelize.define<UserSearchHistoryModel>(
  'user_search_history',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    search_keyword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable({ model, sequelize });

export default model;

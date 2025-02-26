import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

export interface ICategory {
  id?: number;
  name?: string;
  parent_id?: number;
  level?: number;
  desc?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  children?: ICategory[];
}

interface CategoryModel
  extends Model<
      InferAttributes<CategoryModel>,
      InferCreationAttributes<CategoryModel>
    >,
    ICategory {}

const model = sequelize.define<CategoryModel>(
  'categories',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    desc: {
      type: DataTypes.TEXT,
    },
    // created_at: {
    //     type: DataTypes.DATE,
    //     defaultValue: DataTypes.NOW,
    // },
    // updated_at: {
    //     type: DataTypes.DATE,
    //     defaultValue: DataTypes.NOW,
    //     onUpdate: "CURRENT_TIMESTAMP",
    // },
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

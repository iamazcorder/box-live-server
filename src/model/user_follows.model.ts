import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

export interface IUserFollow {
  id?: number;
  follower_id?: number;
  following_id?: number;
  created_at?: Date;
  updatedAt?: Date;
}

interface UserFollowModel
  extends Model<
      InferAttributes<UserFollowModel>,
      InferCreationAttributes<UserFollowModel>
    >,
    IUserFollow {}

const model = sequelize.define<UserFollowModel>(
  'user_follows',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    follower_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    following_id: {
      type: DataTypes.INTEGER,
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

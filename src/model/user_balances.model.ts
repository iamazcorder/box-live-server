import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

interface UserBalanceModel
  extends Model<
    InferAttributes<UserBalanceModel>,
    InferCreationAttributes<UserBalanceModel>
  > {
  id: number;
  user_id: number;
  balance: number;
  total_recharge: number;
  total_spent: number;
  last_recharge_time: Date | null;
  last_spent_time: Date | null;
  created_at: Date;
  updated_at: Date;
}

const model = sequelize.define<UserBalanceModel>(
  'user_balances',
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
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    total_recharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    total_spent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    last_recharge_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_spent_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: 'CURRENT_TIMESTAMP',
    },
  },
  {
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

initTable({ model, sequelize });

export default model;

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

interface GiftModel
  extends Model<
    InferAttributes<GiftModel>,
    InferCreationAttributes<GiftModel>
  > {
  gift_id: number;
  gift_name: string;
  gift_amount: number;
  gift_icon: string;
  created_at: Date;
  updated_at: Date;
}

const model = sequelize.define<GiftModel>(
  'gifts',
  {
    gift_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    gift_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    gift_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    gift_icon: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
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

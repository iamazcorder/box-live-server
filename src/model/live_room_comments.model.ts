import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

interface LiveRoomCommentModel
  extends Model<
    InferAttributes<LiveRoomCommentModel>,
    InferCreationAttributes<LiveRoomCommentModel>
  > {
  id: number;
  room_id: number;
  user_id: number;
  comment_text: string;
  created_at: Date;
}

const model = sequelize.define<LiveRoomCommentModel>(
  'live_room_comments',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
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

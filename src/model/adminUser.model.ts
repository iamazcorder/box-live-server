import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { DataTypes, Model } from 'sequelize';

interface AdminUserModel extends Model {
  id?: number;
  username?: string;
  password: string;
  avatar?: string | null;
  status?: number;
  token?: string;
}

const model = sequelize.define<AdminUserModel>(
  'admin_user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      comment: '管理员ID',
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名',
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码(加密存储)',
    },
    avatar: {
      type: DataTypes.STRING(255),
      comment: '头像URL',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态(0:禁用 1:启用)',
    },
    token: {
      type: DataTypes.STRING(255),
    },
  },
  {
    paranoid: true, // 开启软删除
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    comment: '管理员用户表',
    // hooks: {
    //   beforeCreate: async (admin) => {
    //     if (admin.password) {
    //       // 实际使用时替换为您的加密方法
    //       admin.password = await hashPassword(admin.password);
    //     }
    //   },
    //   beforeUpdate: async (admin) => {
    //     if (admin.changed('password')) {
    //       admin.password = await hashPassword(admin.password);
    //     }
    //   }
    // }
  }
);

// 密码加密函数（示例）
// async function hashPassword(password: string): Promise<string> {
//   const saltRounds = 10;
//   return await require('bcryptjs').hash(password, saltRounds);
// }

initTable({ model, sequelize });

export default model;

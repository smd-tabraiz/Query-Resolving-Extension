import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import User from './User';

class SearchQuery extends Model {
  public id!: string;
  public userId!: string;
  public query!: string;
  public engine!: string;
  public url!: string;
  public category!: string | null;
  public sentiment!: string | null;
  public status!: string;
  public timestamp!: Date;
}

SearchQuery.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    query: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    engine: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sentiment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'search_queries',
  }
);

User.hasMany(SearchQuery, { foreignKey: 'userId' });
SearchQuery.belongsTo(User, { foreignKey: 'userId' });

export default SearchQuery;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import SearchQuery from './SearchQuery';

class Recommendation extends Model {
  public id!: string;
  public queryId!: string;
  public content!: string;
  public resources!: any;
}

Recommendation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    queryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: SearchQuery,
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    resources: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'recommendations',
  }
);

SearchQuery.hasOne(Recommendation, { foreignKey: 'queryId', onDelete: 'CASCADE' });
Recommendation.belongsTo(SearchQuery, { foreignKey: 'queryId', onDelete: 'CASCADE' });

export default Recommendation;

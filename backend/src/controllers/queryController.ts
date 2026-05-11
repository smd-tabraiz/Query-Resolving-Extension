import { Response } from 'express';
import OpenAI from 'openai';
import { AuthRequest } from '../middleware/auth';
import SearchQuery from '../models/SearchQuery';
import Recommendation from '../models/Recommendation';
import User from '../models/User';
import { analyzeQuery } from '../services/aiService';
import { io } from '../index';
import { Op, Sequelize } from 'sequelize';

export const captureQuery = async (req: AuthRequest, res: Response) => {
  try {
    const { query, engine, url, timestamp } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Save initial query
    const savedQuery = await SearchQuery.create({
      userId,
      query,
      engine,
      url,
      timestamp: timestamp || new Date()
    });

    // Async AI analysis
    const analysis = await analyzeQuery(query);
    
    if (analysis) {
      await savedQuery.update({
        category: analysis.category,
        sentiment: analysis.sentiment
      });

      await Recommendation.create({
        queryId: savedQuery.id,
        content: analysis.recommendation,
        resources: analysis.resources
      });
    }

    res.status(201).json({ message: 'Query captured', queryId: savedQuery.id, analysis });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const history = await SearchQuery.findAll({
      where: { userId },
      include: [Recommendation],
      order: [['timestamp', 'DESC']]
    });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // Admin only or personal analytics
    const userId = req.user?.id;
    const totalSearches = await SearchQuery.count({ where: { userId } });
    const categories = await SearchQuery.findAll({
      attributes: ['category', [SearchQuery.sequelize!.fn('COUNT', 'category'), 'count']],
      where: { userId },
      group: ['category']
    });

    res.json({ totalSearches, categories });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGlobalAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.count();
    const totalQueries = await SearchQuery.count();
    const engineStats = await SearchQuery.findAll({
      attributes: ['engine', [SearchQuery.sequelize!.fn('COUNT', 'engine'), 'count']],
      group: ['engine']
    });
    const trendingCategories = await SearchQuery.findAll({
      attributes: ['category', [SearchQuery.sequelize!.fn('COUNT', 'category'), 'count']],
      group: ['category'],
      order: [[SearchQuery.sequelize!.fn('COUNT', 'category'), 'DESC']],
      limit: 5
    });

    res.json({ totalUsers, totalQueries, engineStats, trendingCategories });
  } catch (error: any) {
    console.error('Global Analytics Error:', error);
    res.status(500).json({ message: error.message });
  }
};

import { sendQueryDetails } from '../services/mailService';

export const getGlobalHistory = async (req: AuthRequest, res: Response) => {
  try {
    const queries = await SearchQuery.findAll({
      include: [
        { model: Recommendation },
        { model: User, attributes: ['username', 'email'] }
      ],
      order: [['timestamp', 'DESC']],
      limit: 50
    });
    res.json(queries);
  } catch (error: any) {
    console.error('Global History Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const shareQuery = async (req: AuthRequest, res: Response) => {
  try {
    const { queryId, recipientEmail, customMessage } = req.body;
    const attachments = req.files as any[];
    const queryInfo = await SearchQuery.findByPk(queryId);

    if (!queryInfo) return res.status(404).json({ message: 'Query not found' });

    await sendQueryDetails(recipientEmail, queryInfo, customMessage, attachments);
    
    // Update status to resolved
    await queryInfo.update({ status: 'resolved' });

    res.json({ message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Share Query Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getInterestClusters = async (req: AuthRequest, res: Response) => {
  try {
    const recentQueries = await SearchQuery.findAll({
      order: [['timestamp', 'DESC']],
      attributes: ['query']
    });

    const queryTexts = recentQueries.map(q => q.query).join(', ');
    
    // Read the key from OPENAI_API_KEY as the user placed their Gemini key there
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!queryTexts || !apiKey) throw new Error("No queries or missing API KEY");

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });


    const prompt = `Summarize these search queries into 3-4 distinct 'Interest Clusters'. For each cluster, provide a title and a 1-sentence summary.
Queries: ${queryTexts}

Provide output in strict JSON format: { "clusters": [{ "title": "Cluster Title", "summary": "Cluster Summary" }] }`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.3
        }
    });

    const clusters = JSON.parse(response.text || '{"clusters": []}');
    res.json(clusters.clusters);
  } catch (error: any) {
    console.error('Cluster Error:', error);
    // Fallback mock data in case API key is missing or fails
    const mockClusters = [
      {
        title: "Development Frameworks",
        summary: "High interest in React, Next.js, and modern web deployment strategies."
      },
      {
        title: "AI Integration",
        summary: "Frequent queries regarding LLM APIs, prompt engineering, and intelligent agents."
      },
      {
        title: "Database Architecture",
        summary: "Explorations into SQLite limits, ORMs like Sequelize, and data migrations."
      }
    ];
    res.json(mockClusters); 
  }
};

export const getUserAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const engineStats = await SearchQuery.findAll({
      where: { userId },
      attributes: [
        'engine',
        [Sequelize.fn('COUNT', Sequelize.col('engine')), 'count']
      ],
      group: ['engine']
    });

    const categoryStats = await SearchQuery.findAll({
      where: { userId },
      attributes: [
        ['category', 'name'],
        [Sequelize.fn('COUNT', Sequelize.col('category')), 'value']
      ],
      group: ['category']
    });

    const recentQueries = await SearchQuery.findAll({
      where: { userId },
      limit: 10,
      order: [['timestamp', 'DESC']]
    });

    res.json({ engineStats, categoryStats, recentQueries });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSearchTrends = async (req: AuthRequest, res: Response) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const trends = await SearchQuery.findAll({
      where: {
        timestamp: { [Op.gte]: last24h }
      },
      attributes: [
        [Sequelize.fn('strftime', '%H', Sequelize.col('timestamp')), 'hour'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['hour'],
      order: [['hour', 'ASC']]
    });

    const formattedTrends = Array.from({ length: 24 }, (_, i) => {
      const hourStr = i.toString().padStart(2, '0');
      const trend = trends.find((t: any) => t.get('hour') === hourStr);
      return {
        hour: `${hourStr}:00`,
        count: trend ? parseInt(trend.get('count') as string) : 0
      };
    });

    res.json(formattedTrends);
  } catch (error: any) {
    console.error('Trend Error:', error);
    res.json([]);
  }
};

export const deleteQuery = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    // If admin, find by ID only. If user, find by ID AND userId.
    const whereClause = role === 'ADMIN' ? { id } : { id, userId };
    const query = await SearchQuery.findOne({ where: whereClause });

    if (!query) {
      return res.status(404).json({ message: 'Query not found or unauthorized' });
    }

    // Manually delete linked Recommendation first (SQLite safe approach)
    await Recommendation.destroy({ where: { queryId: id } });

    await query.destroy();
    res.json({ message: 'Query deleted successfully' });
  } catch (error: any) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: error.message });
  }
};






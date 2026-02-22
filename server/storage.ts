import { type User, type InsertUser, type Project, type InsertProject, type ProjectImage, type InsertProjectImage, type NewsCategory, type InsertNewsCategory, type NewsArticle, type InsertNewsArticle, users, projects, projectImages, newsCategories, newsArticles } from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProjectsByCategory(category: string): Promise<Project[]>;
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getProjectImages(projectId: number): Promise<ProjectImage[]>;
  addProjectImage(image: InsertProjectImage): Promise<ProjectImage>;
  deleteProjectImage(id: number): Promise<boolean>;
  getAllNewsCategories(): Promise<NewsCategory[]>;
  getNewsCategory(id: number): Promise<NewsCategory | undefined>;
  createNewsCategory(category: InsertNewsCategory): Promise<NewsCategory>;
  updateNewsCategory(id: number, category: Partial<InsertNewsCategory>): Promise<NewsCategory | undefined>;
  deleteNewsCategory(id: number): Promise<boolean>;
  getAllNewsArticles(): Promise<NewsArticle[]>;
  getPublishedNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticle(id: number): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: number, article: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined>;
  deleteNewsArticle(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.category, category)).orderBy(asc(projects.sortOrder));
  }

  async getAllProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(asc(projects.sortOrder));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db.update(projects).set(project).where(eq(projects.id, id)).returning();
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projectImages).where(eq(projectImages.projectId, id));
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  async getProjectImages(projectId: number): Promise<ProjectImage[]> {
    return db.select().from(projectImages).where(eq(projectImages.projectId, projectId)).orderBy(asc(projectImages.sortOrder));
  }

  async addProjectImage(image: InsertProjectImage): Promise<ProjectImage> {
    const [created] = await db.insert(projectImages).values(image).returning();
    return created;
  }

  async deleteProjectImage(id: number): Promise<boolean> {
    const result = await db.delete(projectImages).where(eq(projectImages.id, id)).returning();
    return result.length > 0;
  }

  async getAllNewsCategories(): Promise<NewsCategory[]> {
    return db.select().from(newsCategories).orderBy(asc(newsCategories.sortOrder));
  }

  async getNewsCategory(id: number): Promise<NewsCategory | undefined> {
    const [cat] = await db.select().from(newsCategories).where(eq(newsCategories.id, id));
    return cat;
  }

  async createNewsCategory(category: InsertNewsCategory): Promise<NewsCategory> {
    const [created] = await db.insert(newsCategories).values(category).returning();
    return created;
  }

  async updateNewsCategory(id: number, category: Partial<InsertNewsCategory>): Promise<NewsCategory | undefined> {
    const [updated] = await db.update(newsCategories).set(category).where(eq(newsCategories.id, id)).returning();
    return updated;
  }

  async deleteNewsCategory(id: number): Promise<boolean> {
    await db.update(newsArticles).set({ categoryId: null }).where(eq(newsArticles.categoryId, id));
    const result = await db.delete(newsCategories).where(eq(newsCategories.id, id)).returning();
    return result.length > 0;
  }

  async getAllNewsArticles(): Promise<NewsArticle[]> {
    return db.select().from(newsArticles).orderBy(desc(newsArticles.createdAt));
  }

  async getPublishedNewsArticles(): Promise<NewsArticle[]> {
    return db.select().from(newsArticles).where(eq(newsArticles.published, 1)).orderBy(desc(newsArticles.createdAt));
  }

  async getNewsArticle(id: number): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return article;
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [created] = await db.insert(newsArticles).values(article).returning();
    return created;
  }

  async updateNewsArticle(id: number, article: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined> {
    const [updated] = await db.update(newsArticles).set(article).where(eq(newsArticles.id, id)).returning();
    return updated;
  }

  async deleteNewsArticle(id: number): Promise<boolean> {
    const result = await db.delete(newsArticles).where(eq(newsArticles.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();

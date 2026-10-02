import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const projects=sqliteTable('projects',{id:text('id').primaryKey(),payload:text('payload').notNull(),revision:integer('revision').notNull().default(1)});
export const ideas=sqliteTable('ideas',{id:text('id').primaryKey(),payload:text('payload').notNull()});
export const events=sqliteTable('events',{id:text('id').primaryKey(),projectId:text('project_id').notNull(),date:text('date').notNull(),title:text('title').notNull()});

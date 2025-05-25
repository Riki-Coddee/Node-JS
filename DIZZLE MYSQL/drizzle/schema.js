import { timeStamp } from 'console';
import { create } from 'domain';
import { relations, sql } from 'drizzle-orm';
import { int, mysqlTable, varchar, timestamp, boolean, text, mysqlEnum } from 'drizzle-orm/mysql-core';

export const usersTable = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  isEmailValid: boolean("is_email_valid").default(false).notNull(),
  avatarURL: text("avatar_url"),
  password: varchar('password', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow().notNull(),
});

export const verifyEmailTokensTable = mysqlTable('verify_email_tokens',{
  id: int('id').autoincrement().primaryKey().notNull(),
  userId: int("user_id").notNull().references(()=>usersTable.id, {onDelete: "cascade"}),
  token: varchar({length:8}).notNull(),
  expiresAt: timestamp('expires_at')
            .default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 DAY)`)
            .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const oauthAccountsTable = mysqlTable('oauth_accounts',{
  id: int('id').primaryKey().autoincrement().notNull(),
  userId: int("user_id").notNull().references(()=>usersTable.id, {onDelete: "cascade"}),
  provider:mysqlEnum("provider", ["google", "github"]).notNull(),
  providerAccountId: varchar("provider_account_id", {length: 255})
                      .notNull()
                      .unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const sessionsTable = mysqlTable('sessions', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').references(()=>
    usersTable.id, {onDelete: 'cascade'}
  ),
  valid: boolean().default(true).notNull(),
  userAgent: text("user_agent"),
  ip:varchar({length:255}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow().notNull(),
})

export const shortLinksTable = mysqlTable('short-link', {
  id: int('id').autoincrement().primaryKey(),
  shortCode: varchar('short_code', { length: 255 }).notNull().unique(),
  url: varchar('url', { length: 300 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow().notNull(),
  userId: int('user_id').notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' })
});
export const passwordResetTokensTable = mysqlTable("password_reset_tokens",{
  id: int('id').autoincrement().notNull().primaryKey(),
  userId: int("user_id")
  .notNull()
  .references(()=>usersTable.id, {onDelete: "cascade"})
  .unique(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at")
  .default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 HOUR)`)
  .notNull(),
  createdAt: timestamp('created_at').default().notNull(),
});
// A user can have many shortLinks and many sessions
export const usersRelationship = relations(usersTable, ({ many }) => ({
  shortLinks: many(shortLinksTable),
  sessions: many(sessionsTable)
}));
// A shortlink belongs to one user
export const shortLinksRelationship = relations(shortLinksTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [shortLinksTable.userId],
    references: [usersTable.id],
  }),
}));

// A session belongs to  one user
export const sessionsRelationship = relations(sessionsTable, ({one})=>({
  user: one(usersTable,{
    fields:[sessionsTable.userId],
    references:[usersTable.id]
  })
}));
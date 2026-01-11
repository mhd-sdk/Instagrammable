import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// User table - Core user information for authentication
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  isAdmin: boolean("is_admin")
    .$default(() => false)
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Session table - Better Auth session management
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// Account table - Better Auth OAuth provider accounts
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Verification table - Better Auth email verification
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

// User Profile - Extended profile information
export const userProfile = pgTable(
  "user_profile",
  {
    id: text("id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    bio: text("bio"),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("idx_user_profile_id").on(table.id)]
);

// Relations
export const userRelations = relations(user, ({ one }) => ({
  profile: one(userProfile, {
    fields: [user.id],
    references: [userProfile.id],
  }),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.id],
    references: [user.id],
  }),
}));

// Type exports
export type User = typeof user.$inferSelect;
export type CreateUserData = typeof user.$inferInsert;
export type UpdateUserData = Partial<Omit<CreateUserData, "id" | "createdAt">>;

export type UserProfile = typeof userProfile.$inferSelect;
export type CreateUserProfileData = typeof userProfile.$inferInsert;
export type UpdateUserProfileData = Partial<Omit<CreateUserProfileData, "id">>;

// ============================================
// Prompt Builder Schema
// ============================================

// Prompt Configuration - Main configuration for user prompts
export const promptConfiguration = pgTable(
  "prompt_configuration",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    isDefault: boolean("is_default")
      .$default(() => false)
      .notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_prompt_config_user_id").on(table.userId),
    index("idx_prompt_config_is_default").on(table.isDefault),
  ]
);

// User Logos - Store user-uploaded logos for prompt configurations
export const userLogo = pgTable(
  "user_logo",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    url: text("url").notNull(),
    mimeType: text("mime_type"),
    sizeBytes: text("size_bytes"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("idx_user_logo_user_id").on(table.userId)]
);

// Color Palette - Store user color configurations
export const colorPalette = pgTable(
  "color_palette",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    primaryColor: text("primary_color").notNull(),
    secondaryColor: text("secondary_color"),
    accentColor: text("accent_color"),
    backgroundColor: text("background_color"),
    textColor: text("text_color"),
    isDefault: boolean("is_default")
      .$default(() => false)
      .notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_color_palette_user_id").on(table.userId),
    index("idx_color_palette_is_default").on(table.isDefault),
  ]
);

// Artistic Direction - Store artistic style configurations
export const artisticDirection = pgTable(
  "artistic_direction",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    style: text("style").notNull(), // e.g., "minimalist", "vibrant", "corporate"
    tone: text("tone"), // e.g., "professional", "playful", "elegant"
    keywords: text("keywords"), // comma-separated or JSON array of keywords
    description: text("description"),
    isDefault: boolean("is_default")
      .$default(() => false)
      .notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_artistic_direction_user_id").on(table.userId),
    index("idx_artistic_direction_is_default").on(table.isDefault),
  ]
);

// Custom Template - Store user-defined prompt templates
export const customTemplate = pgTable(
  "custom_template",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    content: text("content").notNull(), // The template content with placeholders
    category: text("category"), // e.g., "marketing", "social", "product"
    variables: text("variables"), // JSON array of variable definitions
    isPublic: boolean("is_public")
      .$default(() => false)
      .notNull(),
    usageCount: text("usage_count")
      .$default(() => "0")
      .notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_custom_template_user_id").on(table.userId),
    index("idx_custom_template_category").on(table.category),
    index("idx_custom_template_is_public").on(table.isPublic),
  ]
);

// Prompt Configuration Relationships - Link configurations to their components
export const promptConfigLogo = pgTable(
  "prompt_config_logo",
  {
    id: text("id").primaryKey(),
    promptConfigId: text("prompt_config_id")
      .notNull()
      .references(() => promptConfiguration.id, { onDelete: "cascade" }),
    logoId: text("logo_id")
      .notNull()
      .references(() => userLogo.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_prompt_config_logo_config").on(table.promptConfigId),
    index("idx_prompt_config_logo_logo").on(table.logoId),
  ]
);

export const promptConfigColorPalette = pgTable(
  "prompt_config_color_palette",
  {
    id: text("id").primaryKey(),
    promptConfigId: text("prompt_config_id")
      .notNull()
      .references(() => promptConfiguration.id, { onDelete: "cascade" }),
    colorPaletteId: text("color_palette_id")
      .notNull()
      .references(() => colorPalette.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_prompt_config_color_config").on(table.promptConfigId),
    index("idx_prompt_config_color_palette").on(table.colorPaletteId),
  ]
);

export const promptConfigArtisticDirection = pgTable(
  "prompt_config_artistic_direction",
  {
    id: text("id").primaryKey(),
    promptConfigId: text("prompt_config_id")
      .notNull()
      .references(() => promptConfiguration.id, { onDelete: "cascade" }),
    artisticDirectionId: text("artistic_direction_id")
      .notNull()
      .references(() => artisticDirection.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_prompt_config_artistic_config").on(table.promptConfigId),
    index("idx_prompt_config_artistic_direction").on(table.artisticDirectionId),
  ]
);

export const promptConfigTemplate = pgTable(
  "prompt_config_template",
  {
    id: text("id").primaryKey(),
    promptConfigId: text("prompt_config_id")
      .notNull()
      .references(() => promptConfiguration.id, { onDelete: "cascade" }),
    templateId: text("template_id")
      .notNull()
      .references(() => customTemplate.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_prompt_config_template_config").on(table.promptConfigId),
    index("idx_prompt_config_template_template").on(table.templateId),
  ]
);

// ============================================
// Prompt Builder Relations
// ============================================

export const promptConfigurationRelations = relations(
  promptConfiguration,
  ({ one, many }) => ({
    user: one(user, {
      fields: [promptConfiguration.userId],
      references: [user.id],
    }),
    logos: many(promptConfigLogo),
    colorPalettes: many(promptConfigColorPalette),
    artisticDirections: many(promptConfigArtisticDirection),
    templates: many(promptConfigTemplate),
  })
);

export const userLogoRelations = relations(userLogo, ({ one, many }) => ({
  user: one(user, {
    fields: [userLogo.userId],
    references: [user.id],
  }),
  promptConfigs: many(promptConfigLogo),
}));

export const colorPaletteRelations = relations(
  colorPalette,
  ({ one, many }) => ({
    user: one(user, {
      fields: [colorPalette.userId],
      references: [user.id],
    }),
    promptConfigs: many(promptConfigColorPalette),
  })
);

export const artisticDirectionRelations = relations(
  artisticDirection,
  ({ one, many }) => ({
    user: one(user, {
      fields: [artisticDirection.userId],
      references: [user.id],
    }),
    promptConfigs: many(promptConfigArtisticDirection),
  })
);

export const customTemplateRelations = relations(
  customTemplate,
  ({ one, many }) => ({
    user: one(user, {
      fields: [customTemplate.userId],
      references: [user.id],
    }),
    promptConfigs: many(promptConfigTemplate),
  })
);

// Junction table relations
export const promptConfigLogoRelations = relations(
  promptConfigLogo,
  ({ one }) => ({
    promptConfig: one(promptConfiguration, {
      fields: [promptConfigLogo.promptConfigId],
      references: [promptConfiguration.id],
    }),
    logo: one(userLogo, {
      fields: [promptConfigLogo.logoId],
      references: [userLogo.id],
    }),
  })
);

export const promptConfigColorPaletteRelations = relations(
  promptConfigColorPalette,
  ({ one }) => ({
    promptConfig: one(promptConfiguration, {
      fields: [promptConfigColorPalette.promptConfigId],
      references: [promptConfiguration.id],
    }),
    colorPalette: one(colorPalette, {
      fields: [promptConfigColorPalette.colorPaletteId],
      references: [colorPalette.id],
    }),
  })
);

export const promptConfigArtisticDirectionRelations = relations(
  promptConfigArtisticDirection,
  ({ one }) => ({
    promptConfig: one(promptConfiguration, {
      fields: [promptConfigArtisticDirection.promptConfigId],
      references: [promptConfiguration.id],
    }),
    artisticDirection: one(artisticDirection, {
      fields: [promptConfigArtisticDirection.artisticDirectionId],
      references: [artisticDirection.id],
    }),
  })
);

export const promptConfigTemplateRelations = relations(
  promptConfigTemplate,
  ({ one }) => ({
    promptConfig: one(promptConfiguration, {
      fields: [promptConfigTemplate.promptConfigId],
      references: [promptConfiguration.id],
    }),
    template: one(customTemplate, {
      fields: [promptConfigTemplate.templateId],
      references: [customTemplate.id],
    }),
  })
);

// ============================================
// Prompt Templates Library Schema
// ============================================

// Predefined Prompt Templates - System-wide library of templates
export const promptTemplate = pgTable(
  "prompt_template",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    industry: text("industry"), // e.g., "technology", "marketing", "ecommerce", "healthcare"
    style: text("style"), // e.g., "professional", "casual", "creative", "formal"
    content: text("content").notNull(), // Template content with {{variable}} placeholders
    variables: text("variables"), // JSON array of variable definitions
    category: text("category"), // e.g., "social-media", "email", "product-description", "blog"
    tags: text("tags"), // JSON array of tags for better searchability
    exampleOutput: text("example_output"), // Example of what the template produces
    isActive: boolean("is_active")
      .$default(() => true)
      .notNull(),
    sortOrder: text("sort_order")
      .$default(() => "0")
      .notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_prompt_template_industry").on(table.industry),
    index("idx_prompt_template_style").on(table.style),
    index("idx_prompt_template_category").on(table.category),
    index("idx_prompt_template_is_active").on(table.isActive),
  ]
);

// User Saved Templates - User's saved/favorited templates from the library
export const userSavedTemplate = pgTable(
  "user_saved_template",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    templateId: text("template_id")
      .notNull()
      .references(() => promptTemplate.id, { onDelete: "cascade" }),
    customName: text("custom_name"), // User's custom name for this template
    customizations: text("customizations"), // JSON object of user's variable defaults
    isFavorite: boolean("is_favorite")
      .$default(() => false)
      .notNull(),
    usageCount: text("usage_count")
      .$default(() => "0")
      .notNull(),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_user_saved_template_user_id").on(table.userId),
    index("idx_user_saved_template_template_id").on(table.templateId),
    index("idx_user_saved_template_is_favorite").on(table.isFavorite),
  ]
);

// Prompt Template Relations
export const promptTemplateRelations = relations(
  promptTemplate,
  ({ many }) => ({
    userSavedTemplates: many(userSavedTemplate),
  })
);

export const userSavedTemplateRelations = relations(
  userSavedTemplate,
  ({ one }) => ({
    user: one(user, {
      fields: [userSavedTemplate.userId],
      references: [user.id],
    }),
    template: one(promptTemplate, {
      fields: [userSavedTemplate.templateId],
      references: [promptTemplate.id],
    }),
  })
);

// ============================================
// Prompt Builder Type Exports
// ============================================

export type PromptTemplate = typeof promptTemplate.$inferSelect;
export type CreatePromptTemplateData = typeof promptTemplate.$inferInsert;
export type UpdatePromptTemplateData = Partial<
  Omit<CreatePromptTemplateData, "id" | "createdAt">
>;

export type UserSavedTemplate = typeof userSavedTemplate.$inferSelect;
export type CreateUserSavedTemplateData = typeof userSavedTemplate.$inferInsert;
export type UpdateUserSavedTemplateData = Partial<
  Omit<CreateUserSavedTemplateData, "id" | "userId" | "createdAt">
>;

export type PromptConfiguration = typeof promptConfiguration.$inferSelect;
export type CreatePromptConfigurationData =
  typeof promptConfiguration.$inferInsert;
export type UpdatePromptConfigurationData = Partial<
  Omit<CreatePromptConfigurationData, "id" | "userId" | "createdAt">
>;

export type UserLogo = typeof userLogo.$inferSelect;
export type CreateUserLogoData = typeof userLogo.$inferInsert;
export type UpdateUserLogoData = Partial<
  Omit<CreateUserLogoData, "id" | "userId" | "createdAt">
>;

export type ColorPalette = typeof colorPalette.$inferSelect;
export type CreateColorPaletteData = typeof colorPalette.$inferInsert;
export type UpdateColorPaletteData = Partial<
  Omit<CreateColorPaletteData, "id" | "userId" | "createdAt">
>;

export type ArtisticDirection = typeof artisticDirection.$inferSelect;
export type CreateArtisticDirectionData =
  typeof artisticDirection.$inferInsert;
export type UpdateArtisticDirectionData = Partial<
  Omit<CreateArtisticDirectionData, "id" | "userId" | "createdAt">
>;

export type CustomTemplate = typeof customTemplate.$inferSelect;
export type CreateCustomTemplateData = typeof customTemplate.$inferInsert;
export type UpdateCustomTemplateData = Partial<
  Omit<CreateCustomTemplateData, "id" | "userId" | "createdAt">
>;

// ============================================
// Posts Schema
// ============================================

// Posts - User-created posts with image and prompt
export const post = pgTable(
  "post",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title"),
    imageUrl: text("image_url").notNull(),
    prompt: text("prompt").notNull(),
    status: text("status")
      .$default(() => "draft")
      .notNull(), // draft, published, archived
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_post_user_id").on(table.userId),
    index("idx_post_status").on(table.status),
    index("idx_post_created_at").on(table.createdAt),
  ]
);

// Post Relations
export const postRelations = relations(post, ({ one }) => ({
  user: one(user, {
    fields: [post.userId],
    references: [user.id],
  }),
}));

// ============================================
// Posts Type Exports
// ============================================

export type Post = typeof post.$inferSelect;
export type CreatePostData = typeof post.$inferInsert;
export type UpdatePostData = Partial<
  Omit<CreatePostData, "id" | "userId" | "createdAt">
>;

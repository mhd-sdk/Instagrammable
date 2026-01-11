
🔧 Tool: Task
Input: {
  "description": "Explore codebase structure",
  "prompt": "Explore this codebase to understand its structure. I need to implement a \"prompt templates\" feature that creates a library of predefined prompt templates for different industries and styles, allowing users to select templates and customize them for their brand.\n\nPlease thoroughly explore:\n1. The overall project structure (what framework is used, main directories)\n2. How existing features are organized (components, pages, state management)\n3. Any existing patterns for data/content management\n4. The UI component library being used\n5. How routing is handled\n6. Any existing similar features that I can model after\n\nBe very thorough - check package.json, look at the src directory structure, examine existing components and pages.",
  "subagent_type": "Explore"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/package.json"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/mhd/dev/gen-ai-poc/projet-gen-ia -type f -name \"*.json\" | head -20",
  "description": "Find configuration files in project"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/mhd/dev/gen-ai-poc/projet-gen-ia/ | grep -E \"^d|vite|tsconfig\"",
  "description": "List main directories and config files"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/mhd/dev/gen-ai-poc/projet-gen-ia/src -type d -maxdepth 2 | head -30",
  "description": "List src directory structure"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/tsconfig.json"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/mhd/dev/gen-ai-poc/projet-gen-ia/ 2>/dev/null",
  "description": "List root directory contents"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/mhd/dev/gen-ai-poc/projet-gen-ia -maxdepth 2 -type d -not -path \"*/node_modules*\" | sort",
  "description": "List project directories excluding node_modules"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.json",
  "path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*",
  "path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia"
}

🔧 Tool: Bash
Input: {
  "command": "pwd",
  "description": "Check current directory"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/mhd/dev/gen-ai-poc/projet-gen-ia/src -type f -name \"*.tsx\" -o -name \"*.ts\" 2>/dev/null | head -50",
  "description": "Find source files"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src"
}

🔧 Tool: Grep
Input: {
  "pattern": "^import|^export",
  "path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src",
  "output_mode": "files_with_matches",
  "head_limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/vite.config.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/app.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/root.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/entry-client.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/entry-server.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/router.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routeTree.gen.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/__root.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/index.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/dashboard/index.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/dashboard"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/server/db"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/server/db/schema.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/lib"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/mhd/dev/gen-ai-poc/projet-gen-ia -name \"schema.ts\" -o -name \"schema.tsx\" 2>/dev/null",
  "description": "Find schema files"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/mhd/dev/gen-ai-poc/projet-gen-ia/src -type f -name \"*.tsx\" -o -name \"*.ts\" 2>/dev/null | grep -v node_modules | head -60",
  "description": "Find TypeScript source files"
}

🔧 Tool: Bash
Input: {
  "command": "ls /Users/mhd/dev/gen-ai-poc/projet-gen-ia/server 2>/dev/null",
  "description": "List server directory"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/Header.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/lib/auth-client.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/button.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/dialog.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/card.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/lib/utils.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/drizzle.config.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/server/auth.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/db/schema.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/config/privateEnv.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/server/routes"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/dashboard/settings.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/__root.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/server"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/hooks/useProfile.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/utils/storage/helpers.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/Page.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/fn/storage.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/fn/profiles.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/queries/profiles.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/data-access/profiles.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/fn/middleware.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/db"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/db/index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/form.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/input.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/panel.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/label.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/theme-provider.tsx"
}

Excellent! Now I have a comprehensive understanding of the codebase. Let me implement the prompt templates feature following the existing patterns.

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Add prompt template database schema",
      "status": "in_progress",
      "activeForm": "Adding prompt template database schema"
    },
    {
      "content": "Create data access layer for templates",
      "status": "pending",
      "activeForm": "Creating data access layer for templates"
    },
    {
      "content": "Create server functions for templates",
      "status": "pending",
      "activeForm": "Creating server functions for templates"
    },
    {
      "content": "Create query options for templates",
      "status": "pending",
      "activeForm": "Creating query options for templates"
    },
    {
      "content": "Create useTemplates hook",
      "status": "pending",
      "activeForm": "Creating useTemplates hook"
    },
    {
      "content": "Create template UI components",
      "status": "pending",
      "activeForm": "Creating template UI components"
    },
    {
      "content": "Create template routes/pages",
      "status": "pending",
      "activeForm": "Creating template routes/pages"
    },
    {
      "content": "Add navigation links to templates",
      "status": "pending",
      "activeForm": "Adding navigation links to templates"
    },
    {
      "content": "Verify feature with Playwright test",
      "status": "pending",
      "activeForm": "Verifying feature with Playwright test"
    }
  ]
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/db/schema.ts"
}

Now let me add the prompt template schema for the predefined library:

🔧 Tool: Edit
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/db/schema.ts",
  "old_string": "// ============================================\n// Prompt Builder Type Exports\n// ============================================\n\nexport type PromptConfiguration = typeof promptConfiguration.$inferSelect;",
  "new_string": "// ============================================\n// Prompt Templates Library Schema\n// ============================================\n\n// Predefined Prompt Templates - System-wide library of templates\nexport const promptTemplate = pgTable(\n  \"prompt_template\",\n  {\n    id: text(\"id\").primaryKey(),\n    name: text(\"name\").notNull(),\n    description: text(\"description\"),\n    industry: text(\"industry\"), // e.g., \"technology\", \"marketing\", \"ecommerce\", \"healthcare\"\n    style: text(\"style\"), // e.g., \"professional\", \"casual\", \"creative\", \"formal\"\n    content: text(\"content\").notNull(), // Template content with {{variable}} placeholders\n    variables: text(\"variables\"), // JSON array of variable definitions\n    category: text(\"category\"), // e.g., \"social-media\", \"email\", \"product-description\", \"blog\"\n    tags: text(\"tags\"), // JSON array of tags for better searchability\n    exampleOutput: text(\"example_output\"), // Example of what the template produces\n    isActive: boolean(\"is_active\")\n      .$default(() => true)\n      .notNull(),\n    sortOrder: text(\"sort_order\")\n      .$default(() => \"0\")\n      .notNull(),\n    createdAt: timestamp(\"created_at\")\n      .$defaultFn(() => new Date())\n      .notNull(),\n    updatedAt: timestamp(\"updated_at\")\n      .$defaultFn(() => new Date())\n      .notNull(),\n  },\n  (table) => [\n    index(\"idx_prompt_template_industry\").on(table.industry),\n    index(\"idx_prompt_template_style\").on(table.style),\n    index(\"idx_prompt_template_category\").on(table.category),\n    index(\"idx_prompt_template_is_active\").on(table.isActive),\n  ]\n);\n\n// User Saved Templates - User's saved/favorited templates from the library\nexport const userSavedTemplate = pgTable(\n  \"user_saved_template\",\n  {\n    id: text(\"id\").primaryKey(),\n    userId: text(\"user_id\")\n      .notNull()\n      .references(() => user.id, { onDelete: \"cascade\" }),\n    templateId: text(\"template_id\")\n      .notNull()\n      .references(() => promptTemplate.id, { onDelete: \"cascade\" }),\n    customName: text(\"custom_name\"), // User's custom name for this template\n    customizations: text(\"customizations\"), // JSON object of user's variable defaults\n    isFavorite: boolean(\"is_favorite\")\n      .$default(() => false)\n      .notNull(),\n    usageCount: text(\"usage_count\")\n      .$default(() => \"0\")\n      .notNull(),\n    lastUsedAt: timestamp(\"last_used_at\"),\n    createdAt: timestamp(\"created_at\")\n      .$defaultFn(() => new Date())\n      .notNull(),\n    updatedAt: timestamp(\"updated_at\")\n      .$defaultFn(() => new Date())\n      .notNull(),\n  },\n  (table) => [\n    index(\"idx_user_saved_template_user_id\").on(table.userId),\n    index(\"idx_user_saved_template_template_id\").on(table.templateId),\n    index(\"idx_user_saved_template_is_favorite\").on(table.isFavorite),\n  ]\n);\n\n// Prompt Template Relations\nexport const promptTemplateRelations = relations(\n  promptTemplate,\n  ({ many }) => ({\n    userSavedTemplates: many(userSavedTemplate),\n  })\n);\n\nexport const userSavedTemplateRelations = relations(\n  userSavedTemplate,\n  ({ one }) => ({\n    user: one(user, {\n      fields: [userSavedTemplate.userId],\n      references: [user.id],\n    }),\n    template: one(promptTemplate, {\n      fields: [userSavedTemplate.templateId],\n      references: [promptTemplate.id],\n    }),\n  })\n);\n\n// ============================================\n// Prompt Builder Type Exports\n// ============================================\n\nexport type PromptTemplate = typeof promptTemplate.$inferSelect;\nexport type CreatePromptTemplateData = typeof promptTemplate.$inferInsert;\nexport type UpdatePromptTemplateData = Partial<\n  Omit<CreatePromptTemplateData, \"id\" | \"createdAt\">\n>;\n\nexport type UserSavedTemplate = typeof userSavedTemplate.$inferSelect;\nexport type CreateUserSavedTemplateData = typeof userSavedTemplate.$inferInsert;\nexport type UpdateUserSavedTemplateData = Partial<\n  Omit<CreateUserSavedTemplateData, \"id\" | \"userId\" | \"createdAt\">\n>;\n\nexport type PromptConfiguration = typeof promptConfiguration.$inferSelect;"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Add prompt template database schema",
      "status": "completed",
      "activeForm": "Adding prompt template database schema"
    },
    {
      "content": "Create data access layer for templates",
      "status": "in_progress",
      "activeForm": "Creating data access layer for templates"
    },
    {
      "content": "Create server functions for templates",
      "status": "pending",
      "activeForm": "Creating server functions for templates"
    },
    {
      "content": "Create query options for templates",
      "status": "pending",
      "activeForm": "Creating query options for templates"
    },
    {
      "content": "Create useTemplates hook",
      "status": "pending",
      "activeForm": "Creating useTemplates hook"
    },
    {
      "content": "Create template UI components",
      "status": "pending",
      "activeForm": "Creating template UI components"
    },
    {
      "content": "Create template routes/pages",
      "status": "pending",
      "activeForm": "Creating template routes/pages"
    },
    {
      "content": "Add navigation links to templates",
      "status": "pending",
      "activeForm": "Adding navigation links to templates"
    },
    {
      "content": "Verify feature with Playwright test",
      "status": "pending",
      "activeForm": "Verifying feature with Playwright test"
    }
  ]
}

Now let me read an existing data access file to follow the pattern:

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/data-access/profiles.ts"
}

Now let me create the data access layer for templates:

🔧 Tool: Write
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/data-access/templates.ts",
  "content": "import { eq, and, or, ilike, desc, asc, sql } from \"drizzle-orm\";\nimport { database } from \"~/db\";\nimport {\n  promptTemplate,\n  userSavedTemplate,\n  type PromptTemplate,\n  type CreatePromptTemplateData,\n  type UpdatePromptTemplateData,\n  type UserSavedTemplate,\n  type CreateUserSavedTemplateData,\n  type UpdateUserSavedTemplateData,\n} from \"~/db/schema\";\n\n// ============================================\n// Prompt Template Library (System-wide)\n// ============================================\n\nexport type TemplateFilters = {\n  industry?: string;\n  style?: string;\n  category?: string;\n  search?: string;\n};\n\nexport type TemplateWithSavedInfo = PromptTemplate & {\n  isSaved?: boolean;\n  isFavorite?: boolean;\n  userCustomizations?: string | null;\n};\n\n/**\n * Get all active prompt templates with optional filtering\n */\nexport async function getPromptTemplates(\n  filters?: TemplateFilters\n): Promise<PromptTemplate[]> {\n  let query = database\n    .select()\n    .from(promptTemplate)\n    .where(eq(promptTemplate.isActive, true))\n    .$dynamic();\n\n  // Apply filters if provided\n  const conditions = [eq(promptTemplate.isActive, true)];\n\n  if (filters?.industry) {\n    conditions.push(eq(promptTemplate.industry, filters.industry));\n  }\n\n  if (filters?.style) {\n    conditions.push(eq(promptTemplate.style, filters.style));\n  }\n\n  if (filters?.category) {\n    conditions.push(eq(promptTemplate.category, filters.category));\n  }\n\n  if (filters?.search) {\n    conditions.push(\n      or(\n        ilike(promptTemplate.name, `%${filters.search}%`),\n        ilike(promptTemplate.description, `%${filters.search}%`)\n      )!\n    );\n  }\n\n  const results = await database\n    .select()\n    .from(promptTemplate)\n    .where(and(...conditions))\n    .orderBy(asc(promptTemplate.sortOrder), desc(promptTemplate.createdAt));\n\n  return results;\n}\n\n/**\n * Get a single prompt template by ID\n */\nexport async function getPromptTemplateById(\n  id: string\n): Promise<PromptTemplate | null> {\n  const [result] = await database\n    .select()\n    .from(promptTemplate)\n    .where(eq(promptTemplate.id, id))\n    .limit(1);\n\n  return result ?? null;\n}\n\n/**\n * Get distinct industries from templates\n */\nexport async function getTemplateIndustries(): Promise<string[]> {\n  const results = await database\n    .selectDistinct({ industry: promptTemplate.industry })\n    .from(promptTemplate)\n    .where(eq(promptTemplate.isActive, true));\n\n  return results\n    .map((r) => r.industry)\n    .filter((i): i is string => i !== null);\n}\n\n/**\n * Get distinct styles from templates\n */\nexport async function getTemplateStyles(): Promise<string[]> {\n  const results = await database\n    .selectDistinct({ style: promptTemplate.style })\n    .from(promptTemplate)\n    .where(eq(promptTemplate.isActive, true));\n\n  return results.map((r) => r.style).filter((s): s is string => s !== null);\n}\n\n/**\n * Get distinct categories from templates\n */\nexport async function getTemplateCategories(): Promise<string[]> {\n  const results = await database\n    .selectDistinct({ category: promptTemplate.category })\n    .from(promptTemplate)\n    .where(eq(promptTemplate.isActive, true));\n\n  return results\n    .map((r) => r.category)\n    .filter((c): c is string => c !== null);\n}\n\n/**\n * Create a new prompt template (admin only)\n */\nexport async function createPromptTemplate(\n  data: CreatePromptTemplateData\n): Promise<PromptTemplate> {\n  const [result] = await database\n    .insert(promptTemplate)\n    .values(data)\n    .returning();\n\n  return result;\n}\n\n/**\n * Update a prompt template (admin only)\n */\nexport async function updatePromptTemplate(\n  id: string,\n  data: UpdatePromptTemplateData\n): Promise<PromptTemplate> {\n  const [result] = await database\n    .update(promptTemplate)\n    .set({\n      ...data,\n      updatedAt: new Date(),\n    })\n    .where(eq(promptTemplate.id, id))\n    .returning();\n\n  return result;\n}\n\n/**\n * Delete a prompt template (admin only)\n */\nexport async function deletePromptTemplate(id: string): Promise<void> {\n  await database.delete(promptTemplate).where(eq(promptTemplate.id, id));\n}\n\n// ============================================\n// User Saved Templates\n// ============================================\n\n/**\n * Get all saved templates for a user\n */\nexport async function getUserSavedTemplates(\n  userId: string\n): Promise<(UserSavedTemplate & { template: PromptTemplate })[]> {\n  const results = await database\n    .select({\n      savedTemplate: userSavedTemplate,\n      template: promptTemplate,\n    })\n    .from(userSavedTemplate)\n    .innerJoin(\n      promptTemplate,\n      eq(userSavedTemplate.templateId, promptTemplate.id)\n    )\n    .where(eq(userSavedTemplate.userId, userId))\n    .orderBy(desc(userSavedTemplate.createdAt));\n\n  return results.map((r) => ({\n    ...r.savedTemplate,\n    template: r.template,\n  }));\n}\n\n/**\n * Get user's favorite templates\n */\nexport async function getUserFavoriteTemplates(\n  userId: string\n): Promise<(UserSavedTemplate & { template: PromptTemplate })[]> {\n  const results = await database\n    .select({\n      savedTemplate: userSavedTemplate,\n      template: promptTemplate,\n    })\n    .from(userSavedTemplate)\n    .innerJoin(\n      promptTemplate,\n      eq(userSavedTemplate.templateId, promptTemplate.id)\n    )\n    .where(\n      and(\n        eq(userSavedTemplate.userId, userId),\n        eq(userSavedTemplate.isFavorite, true)\n      )\n    )\n    .orderBy(desc(userSavedTemplate.createdAt));\n\n  return results.map((r) => ({\n    ...r.savedTemplate,\n    template: r.template,\n  }));\n}\n\n/**\n * Check if user has saved a template\n */\nexport async function getUserSavedTemplate(\n  userId: string,\n  templateId: string\n): Promise<UserSavedTemplate | null> {\n  const [result] = await database\n    .select()\n    .from(userSavedTemplate)\n    .where(\n      and(\n        eq(userSavedTemplate.userId, userId),\n        eq(userSavedTemplate.templateId, templateId)\n      )\n    )\n    .limit(1);\n\n  return result ?? null;\n}\n\n/**\n * Save a template for a user\n */\nexport async function saveTemplateForUser(\n  data: CreateUserSavedTemplateData\n): Promise<UserSavedTemplate> {\n  // Check if already saved\n  const existing = await getUserSavedTemplate(data.userId, data.templateId);\n  if (existing) {\n    return existing;\n  }\n\n  const [result] = await database\n    .insert(userSavedTemplate)\n    .values(data)\n    .returning();\n\n  return result;\n}\n\n/**\n * Update a user's saved template\n */\nexport async function updateUserSavedTemplate(\n  id: string,\n  userId: string,\n  data: UpdateUserSavedTemplateData\n): Promise<UserSavedTemplate> {\n  const [result] = await database\n    .update(userSavedTemplate)\n    .set({\n      ...data,\n      updatedAt: new Date(),\n    })\n    .where(\n      and(eq(userSavedTemplate.id, id), eq(userSavedTemplate.userId, userId))\n    )\n    .returning();\n\n  return result;\n}\n\n/**\n * Toggle favorite status for a saved template\n */\nexport async function toggleTemplateFavorite(\n  id: string,\n  userId: string\n): Promise<UserSavedTemplate> {\n  // Get current state\n  const [current] = await database\n    .select()\n    .from(userSavedTemplate)\n    .where(\n      and(eq(userSavedTemplate.id, id), eq(userSavedTemplate.userId, userId))\n    )\n    .limit(1);\n\n  if (!current) {\n    throw new Error(\"Saved template not found\");\n  }\n\n  // Toggle favorite\n  const [result] = await database\n    .update(userSavedTemplate)\n    .set({\n      isFavorite: !current.isFavorite,\n      updatedAt: new Date(),\n    })\n    .where(\n      and(eq(userSavedTemplate.id, id), eq(userSavedTemplate.userId, userId))\n    )\n    .returning();\n\n  return result;\n}\n\n/**\n * Remove a saved template for a user\n */\nexport async function removeUserSavedTemplate(\n  id: string,\n  userId: string\n): Promise<void> {\n  await database\n    .delete(userSavedTemplate)\n    .where(\n      and(eq(userSavedTemplate.id, id), eq(userSavedTemplate.userId, userId))\n    );\n}\n\n/**\n * Increment usage count for a saved template\n */\nexport async function incrementTemplateUsage(\n  id: string,\n  userId: string\n): Promise<void> {\n  await database\n    .update(userSavedTemplate)\n    .set({\n      usageCount: sql`(${userSavedTemplate.usageCount}::integer + 1)::text`,\n      lastUsedAt: new Date(),\n      updatedAt: new Date(),\n    })\n    .where(\n      and(eq(userSavedTemplate.id, id), eq(userSavedTemplate.userId, userId))\n    );\n}\n\n/**\n * Get templates with user's saved info merged\n */\nexport async function getTemplatesWithUserInfo(\n  userId: string,\n  filters?: TemplateFilters\n): Promise<TemplateWithSavedInfo[]> {\n  // Get all templates\n  const templates = await getPromptTemplates(filters);\n\n  // Get user's saved templates\n  const savedTemplates = await database\n    .select()\n    .from(userSavedTemplate)\n    .where(eq(userSavedTemplate.userId, userId));\n\n  // Create a map for quick lookup\n  const savedMap = new Map(\n    savedTemplates.map((st) => [\n      st.templateId,\n      { isSaved: true, isFavorite: st.isFavorite, customizations: st.customizations },\n    ])\n  );\n\n  // Merge the info\n  return templates.map((template) => ({\n    ...template,\n    isSaved: savedMap.get(template.id)?.isSaved ?? false,\n    isFavorite: savedMap.get(template.id)?.isFavorite ?? false,\n    userCustomizations: savedMap.get(template.id)?.customizations ?? null,\n  }));\n}\n"
}

Now let me read the existing server functions pattern:

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/fn/profiles.ts"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Add prompt template database schema",
      "status": "completed",
      "activeForm": "Adding prompt template database schema"
    },
    {
      "content": "Create data access layer for templates",
      "status": "completed",
      "activeForm": "Creating data access layer for templates"
    },
    {
      "content": "Create server functions for templates",
      "status": "in_progress",
      "activeForm": "Creating server functions for templates"
    },
    {
      "content": "Create query options for templates",
      "status": "pending",
      "activeForm": "Creating query options for templates"
    },
    {
      "content": "Create useTemplates hook",
      "status": "pending",
      "activeForm": "Creating useTemplates hook"
    },
    {
      "content": "Create template UI components",
      "status": "pending",
      "activeForm": "Creating template UI components"
    },
    {
      "content": "Create template routes/pages",
      "status": "pending",
      "activeForm": "Creating template routes/pages"
    },
    {
      "content": "Add navigation links to templates",
      "status": "pending",
      "activeForm": "Adding navigation links to templates"
    },
    {
      "content": "Verify feature with Playwright test",
      "status": "pending",
      "activeForm": "Verifying feature with Playwright test"
    }
  ]
}

Now let me create the server functions:
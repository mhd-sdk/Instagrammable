CREATE TABLE "artistic_direction" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"style" text NOT NULL,
	"tone" text,
	"keywords" text,
	"description" text,
	"is_default" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "color_palette" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"primary_color" text NOT NULL,
	"secondary_color" text,
	"accent_color" text,
	"background_color" text,
	"text_color" text,
	"is_default" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_template" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"category" text,
	"variables" text,
	"is_public" boolean NOT NULL,
	"usage_count" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_config_artistic_direction" (
	"id" text PRIMARY KEY NOT NULL,
	"prompt_config_id" text NOT NULL,
	"artistic_direction_id" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_config_color_palette" (
	"id" text PRIMARY KEY NOT NULL,
	"prompt_config_id" text NOT NULL,
	"color_palette_id" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_config_logo" (
	"id" text PRIMARY KEY NOT NULL,
	"prompt_config_id" text NOT NULL,
	"logo_id" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_config_template" (
	"id" text PRIMARY KEY NOT NULL,
	"prompt_config_id" text NOT NULL,
	"template_id" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_configuration" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_default" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_logo" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"mime_type" text,
	"size_bytes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artistic_direction" ADD CONSTRAINT "artistic_direction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "color_palette" ADD CONSTRAINT "color_palette_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_template" ADD CONSTRAINT "custom_template_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_config_artistic_direction" ADD CONSTRAINT "prompt_config_artistic_direction_prompt_config_id_prompt_configuration_id_fk" FOREIGN KEY ("prompt_config_id") REFERENCES "public"."prompt_configuration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_config_artistic_direction" ADD CONSTRAINT "prompt_config_artistic_direction_artistic_direction_id_artistic_direction_id_fk" FOREIGN KEY ("artistic_direction_id") REFERENCES "public"."artistic_direction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_config_color_palette" ADD CONSTRAINT "prompt_config_color_palette_prompt_config_id_prompt_configuration_id_fk" FOREIGN KEY ("prompt_config_id") REFERENCES "public"."prompt_configuration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_config_color_palette" ADD CONSTRAINT "prompt_config_color_palette_color_palette_id_color_palette_id_fk" FOREIGN KEY ("color_palette_id") REFERENCES "public"."color_palette"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_config_logo" ADD CONSTRAINT "prompt_config_logo_prompt_config_id_prompt_configuration_id_fk" FOREIGN KEY ("prompt_config_id") REFERENCES "public"."prompt_configuration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_config_logo" ADD CONSTRAINT "prompt_config_logo_logo_id_user_logo_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."user_logo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_config_template" ADD CONSTRAINT "prompt_config_template_prompt_config_id_prompt_configuration_id_fk" FOREIGN KEY ("prompt_config_id") REFERENCES "public"."prompt_configuration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_config_template" ADD CONSTRAINT "prompt_config_template_template_id_custom_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."custom_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_configuration" ADD CONSTRAINT "prompt_configuration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_logo" ADD CONSTRAINT "user_logo_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_artistic_direction_user_id" ON "artistic_direction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_artistic_direction_is_default" ON "artistic_direction" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "idx_color_palette_user_id" ON "color_palette" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_color_palette_is_default" ON "color_palette" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "idx_custom_template_user_id" ON "custom_template" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_custom_template_category" ON "custom_template" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_custom_template_is_public" ON "custom_template" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_prompt_config_artistic_config" ON "prompt_config_artistic_direction" USING btree ("prompt_config_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_config_artistic_direction" ON "prompt_config_artistic_direction" USING btree ("artistic_direction_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_config_color_config" ON "prompt_config_color_palette" USING btree ("prompt_config_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_config_color_palette" ON "prompt_config_color_palette" USING btree ("color_palette_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_config_logo_config" ON "prompt_config_logo" USING btree ("prompt_config_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_config_logo_logo" ON "prompt_config_logo" USING btree ("logo_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_config_template_config" ON "prompt_config_template" USING btree ("prompt_config_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_config_template_template" ON "prompt_config_template" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_config_user_id" ON "prompt_configuration" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_config_is_default" ON "prompt_configuration" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "idx_user_logo_user_id" ON "user_logo" USING btree ("user_id");
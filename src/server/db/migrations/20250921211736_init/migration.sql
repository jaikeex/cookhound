-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(128) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(110),
    "auth_type" VARCHAR(50) NOT NULL DEFAULT 'local',
    "role" VARCHAR(50) NOT NULL DEFAULT 'user',
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "avatar_url" VARCHAR(255),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" VARCHAR(36),
    "password_reset_token" VARCHAR(36),
    "password_reset_token_expires" TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_visited_at" TIMESTAMP(3),
    "last_login" TIMESTAMP(3),
    "last_password_reset" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cookie_consents" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "accepted" VARCHAR(255)[],
    "version" VARCHAR(255) NOT NULL DEFAULT '2025-09-15',
    "user_ip_address" VARCHAR(255),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "proof_hash" VARCHAR(255) NOT NULL,

    CONSTRAINT "cookie_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_preferences" (
    "user_id" INTEGER NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."email_change_requests" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "newEmail" TEXT NOT NULL,
    "token" VARCHAR(36) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recipes" (
    "id" SERIAL NOT NULL,
    "display_id" VARCHAR(36) NOT NULL,
    "author_id" INTEGER NOT NULL,
    "language" VARCHAR(2) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "time" INTEGER,
    "portion_size" INTEGER,
    "image_url" VARCHAR(255),
    "rating" DECIMAL(2,1),
    "times_rated" INTEGER NOT NULL DEFAULT 0,
    "times_viewed" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instructions" (
    "recipe_id" INTEGER NOT NULL,
    "step" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "instructions_pkey" PRIMARY KEY ("recipe_id","step")
);

-- CreateTable
CREATE TABLE "public"."ingredients" (
    "id" SERIAL NOT NULL,
    "language" VARCHAR(2) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recipes_ingredients" (
    "recipe_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "quantity" VARCHAR(256),
    "ingredient_order" INTEGER NOT NULL,

    CONSTRAINT "recipes_ingredients_pkey" PRIMARY KEY ("recipe_id","ingredient_id")
);

-- CreateTable
CREATE TABLE "public"."shopping_list_ingredients" (
    "user_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "quantity" VARCHAR(256),
    "marked" BOOLEAN NOT NULL DEFAULT false,
    "ingredient_order" INTEGER NOT NULL,

    CONSTRAINT "shopping_list_ingredients_pkey" PRIMARY KEY ("user_id","ingredient_id","recipe_id")
);

-- CreateTable
CREATE TABLE "public"."ratings" (
    "id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" DECIMAL(2,1) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_visited_recipes" (
    "user_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "public"."recipe_flags" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tag_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "tag_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recipes_tags" (
    "recipe_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "recipes_tags_pkey" PRIMARY KEY ("recipe_id","tag_id")
);

-- CreateTable
CREATE TABLE "public"."tag_translations" (
    "tag_id" INTEGER NOT NULL,
    "language" VARCHAR(2) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "tag_translations_pkey" PRIMARY KEY ("tag_id","language")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_verification_token_idx" ON "public"."users"("email_verification_token");

-- CreateIndex
CREATE INDEX "users_password_reset_token_idx" ON "public"."users"("password_reset_token");

-- CreateIndex
CREATE INDEX "cookie_consents_id_user_id_idx" ON "public"."cookie_consents"("id", "user_id");

-- CreateIndex
CREATE INDEX "user_preferences_user_id_idx" ON "public"."user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_change_requests_userId_key" ON "public"."email_change_requests"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_change_requests_newEmail_key" ON "public"."email_change_requests"("newEmail");

-- CreateIndex
CREATE UNIQUE INDEX "email_change_requests_token_key" ON "public"."email_change_requests"("token");

-- CreateIndex
CREATE INDEX "email_change_requests_token_expiresAt_idx" ON "public"."email_change_requests"("token", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_display_id_key" ON "public"."recipes"("display_id");

-- CreateIndex
CREATE INDEX "recipes_author_id_idx" ON "public"."recipes"("author_id");

-- CreateIndex
CREATE INDEX "recipes_display_id_idx" ON "public"."recipes"("display_id");

-- CreateIndex
CREATE INDEX "recipes_language_idx" ON "public"."recipes"("language");

-- CreateIndex
CREATE INDEX "recipes_title_idx" ON "public"."recipes"("title");

-- CreateIndex
CREATE INDEX "recipes_rating_idx" ON "public"."recipes"("rating");

-- CreateIndex
CREATE INDEX "recipes_time_idx" ON "public"."recipes"("time");

-- CreateIndex
CREATE INDEX "recipes_created_at_idx" ON "public"."recipes"("created_at");

-- CreateIndex
CREATE INDEX "idx_recipes_rating_time" ON "public"."recipes"("rating", "time");

-- CreateIndex
CREATE INDEX "instructions_recipe_id_idx" ON "public"."instructions"("recipe_id");

-- CreateIndex
CREATE INDEX "instructions_step_idx" ON "public"."instructions"("step");

-- CreateIndex
CREATE INDEX "ingredients_language_idx" ON "public"."ingredients"("language");

-- CreateIndex
CREATE INDEX "ingredients_name_idx" ON "public"."ingredients"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_language_name_key" ON "public"."ingredients"("language", "name");

-- CreateIndex
CREATE INDEX "recipes_ingredients_recipe_id_idx" ON "public"."recipes_ingredients"("recipe_id");

-- CreateIndex
CREATE INDEX "recipes_ingredients_ingredient_id_idx" ON "public"."recipes_ingredients"("ingredient_id");

-- CreateIndex
CREATE INDEX "shopping_list_ingredients_user_id_recipe_id_idx" ON "public"."shopping_list_ingredients"("user_id", "recipe_id");

-- CreateIndex
CREATE INDEX "shopping_list_ingredients_user_id_idx" ON "public"."shopping_list_ingredients"("user_id");

-- CreateIndex
CREATE INDEX "shopping_list_ingredients_ingredient_id_idx" ON "public"."shopping_list_ingredients"("ingredient_id");

-- CreateIndex
CREATE INDEX "ratings_recipe_id_idx" ON "public"."ratings"("recipe_id");

-- CreateIndex
CREATE INDEX "ratings_user_id_idx" ON "public"."ratings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_recipe_id_user_id_key" ON "public"."ratings"("recipe_id", "user_id");

-- CreateIndex
CREATE INDEX "user_visited_recipes_user_id_visited_at_idx" ON "public"."user_visited_recipes"("user_id", "visited_at");

-- CreateIndex
CREATE INDEX "user_visited_recipes_user_id_idx" ON "public"."user_visited_recipes"("user_id");

-- CreateIndex
CREATE INDEX "user_visited_recipes_recipe_id_idx" ON "public"."user_visited_recipes"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_visited_recipes_user_id_recipe_id_key" ON "public"."user_visited_recipes"("user_id", "recipe_id");

-- CreateIndex
CREATE INDEX "recipe_flags_user_id_idx" ON "public"."recipe_flags"("user_id");

-- CreateIndex
CREATE INDEX "recipe_flags_recipe_id_idx" ON "public"."recipe_flags"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_categories_name_key" ON "public"."tag_categories"("name");

-- CreateIndex
CREATE INDEX "tag_categories_name_idx" ON "public"."tag_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "public"."tags"("slug");

-- CreateIndex
CREATE INDEX "tags_category_id_idx" ON "public"."tags"("category_id");

-- CreateIndex
CREATE INDEX "tags_slug_idx" ON "public"."tags"("slug");

-- CreateIndex
CREATE INDEX "recipes_tags_tag_id_idx" ON "public"."recipes_tags"("tag_id");

-- CreateIndex
CREATE INDEX "tag_translations_language_idx" ON "public"."tag_translations"("language");

-- AddForeignKey
ALTER TABLE "public"."cookie_consents" ADD CONSTRAINT "cookie_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_change_requests" ADD CONSTRAINT "email_change_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recipes" ADD CONSTRAINT "recipes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instructions" ADD CONSTRAINT "instructions_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recipes_ingredients" ADD CONSTRAINT "recipes_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recipes_ingredients" ADD CONSTRAINT "recipes_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shopping_list_ingredients" ADD CONSTRAINT "shopping_list_ingredients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shopping_list_ingredients" ADD CONSTRAINT "shopping_list_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shopping_list_ingredients" ADD CONSTRAINT "shopping_list_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_visited_recipes" ADD CONSTRAINT "user_visited_recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_visited_recipes" ADD CONSTRAINT "user_visited_recipes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recipe_flags" ADD CONSTRAINT "recipe_flags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recipe_flags" ADD CONSTRAINT "recipe_flags_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tags" ADD CONSTRAINT "tags_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."tag_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recipes_tags" ADD CONSTRAINT "recipes_tags_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recipes_tags" ADD CONSTRAINT "recipes_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tag_translations" ADD CONSTRAINT "tag_translations_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

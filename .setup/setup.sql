-- ----------------------------
-- Table structure for entity
-- ----------------------------
DROP TABLE IF EXISTS "public"."entity";
CREATE TABLE "public"."entity" (
  "id" uuid NOT NULL,
  "name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "parent" uuid,
  "owner" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "is_container" bool NOT NULL DEFAULT true,
  "active" bool NOT NULL DEFAULT true,
  "image" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::text,
  "note" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "quantity" numeric(12,2) NOT NULL DEFAULT 0,
  "unit" varchar(10) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "expiry" date,
  "prop" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "sort" int2 NOT NULL DEFAULT 0,
  "create_time" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Primary Key structure for table entity
-- ----------------------------
ALTER TABLE "public"."entity" ADD CONSTRAINT "entity_pkey" PRIMARY KEY ("id");

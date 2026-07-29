CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_acompanhamentos" (
	"user_id" text NOT NULL,
	"politico_id" text NOT NULL,
	"seguido_em" text NOT NULL,
	"nota" text,
	CONSTRAINT "user_acompanhamentos_user_id_politico_id_pk" PRIMARY KEY("user_id","politico_id")
);
--> statement-breakpoint
CREATE TABLE "user_cola" (
	"user_id" text NOT NULL,
	"cargo" text NOT NULL,
	"politico_id" text NOT NULL,
	"nome" text NOT NULL,
	"nome_urna" text NOT NULL,
	"partido" text NOT NULL,
	"uf" text NOT NULL,
	CONSTRAINT "user_cola_user_id_cargo_pk" PRIMARY KEY("user_id","cargo")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"uf" text,
	"onboarding_step" integer DEFAULT 0 NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_acompanhamentos" ADD CONSTRAINT "user_acompanhamentos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_acompanhamentos" ADD CONSTRAINT "user_acompanhamentos_politico_id_mandatarios_id_fk" FOREIGN KEY ("politico_id") REFERENCES "public"."mandatarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_cola" ADD CONSTRAINT "user_cola_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_hash_idx" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "user_acompanhamentos_user_id_idx" ON "user_acompanhamentos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_cola_user_id_idx" ON "user_cola" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");
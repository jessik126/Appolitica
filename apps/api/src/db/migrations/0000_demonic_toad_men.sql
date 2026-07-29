CREATE TABLE "acoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"politico_id" text NOT NULL,
	"data" text NOT NULL,
	"tipo" text NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text NOT NULL,
	"fonte" text
);
--> statement-breakpoint
CREATE TABLE "mandatarios" (
	"id" text PRIMARY KEY NOT NULL,
	"casa" text,
	"external_id" text,
	"nome" text NOT NULL,
	"nome_urna" text NOT NULL,
	"cargo" text NOT NULL,
	"partido" text NOT NULL,
	"uf" text NOT NULL,
	"foto" text,
	"contatos" jsonb NOT NULL,
	"resumo" text NOT NULL,
	"fonte" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_metadata" (
	"fonte" text PRIMARY KEY NOT NULL,
	"ultima_atualizacao" text NOT NULL,
	"total" text NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "acoes" ADD CONSTRAINT "acoes_politico_id_mandatarios_id_fk" FOREIGN KEY ("politico_id") REFERENCES "public"."mandatarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "acoes_politico_id_idx" ON "acoes" USING btree ("politico_id");--> statement-breakpoint
CREATE INDEX "mandatarios_casa_idx" ON "mandatarios" USING btree ("casa");--> statement-breakpoint
CREATE INDEX "mandatarios_uf_idx" ON "mandatarios" USING btree ("uf");--> statement-breakpoint
CREATE INDEX "mandatarios_partido_idx" ON "mandatarios" USING btree ("partido");--> statement-breakpoint
CREATE INDEX "mandatarios_cargo_idx" ON "mandatarios" USING btree ("cargo");--> statement-breakpoint
CREATE INDEX "mandatarios_fonte_idx" ON "mandatarios" USING btree ("fonte");
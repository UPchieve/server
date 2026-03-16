-- migrate:up
ALTER TABLE "upchieve"."nths_advisors"
    ALTER COLUMN "phone" DROP NOT NULL;

-- migrate:down
ALTER TABLE "upchieve"."nths_advisors"
    ALTER COLUMN "phone" SET NOT NULL;


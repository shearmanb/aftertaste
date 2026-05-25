-- OutsideCup: log coffee had at a café or shop (not home-brewed).
-- Bean is optional — you may not know what was used.

CREATE TABLE "OutsideCup" (
    "id" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "locationNote" TEXT,
    "method" TEXT NOT NULL,
    "beanId" TEXT,
    "overallScore" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutsideCup_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OutsideCup_beanId_fkey" FOREIGN KEY ("beanId") REFERENCES "Bean"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

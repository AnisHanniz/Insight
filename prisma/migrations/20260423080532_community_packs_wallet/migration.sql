-- AlterTable
ALTER TABLE "Pack" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "creatorShareIP" INTEGER,
ADD COLUMN     "isCommunity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceIP" INTEGER,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'approved',
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "creatorBadge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountIP" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "stripeRef" TEXT,
    "packId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountIP" INTEGER NOT NULL,
    "amountUSD" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payoutMethod" TEXT,
    "payoutDetails" JSONB,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "amountIP" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Withdrawal_userId_createdAt_idx" ON "Withdrawal"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PackPurchase_packId_idx" ON "PackPurchase"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "PackPurchase_userId_packId_key" ON "PackPurchase"("userId", "packId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackPurchase" ADD CONSTRAINT "PackPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackPurchase" ADD CONSTRAINT "PackPurchase_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "deletadaEm" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "accounts_deletadaEm_idx" ON "accounts"("deletadaEm");

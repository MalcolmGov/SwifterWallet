-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('CREDIT', 'DEBIT');

-- AlterTable
ALTER TABLE "ledger_entries" ADD COLUMN     "type" "LedgerEntryType" NOT NULL DEFAULT 'CREDIT';

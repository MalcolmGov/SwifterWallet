import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(url),
});

async function main() {
  // Create or find the demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@swifter.app" },
    update: {},
    create: {
      email: "demo@swifter.app",
      name: "Demo User",
    },
  });

  console.log(`User: ${user.id} (${user.email})`);

  // Check if wallets already exist for this user
  const existingWallets = await prisma.wallet.findMany({
    where: { userId: user.id },
  });

  if (existingWallets.length > 0) {
    console.log(`Wallets already exist for this user (${existingWallets.length} found). Skipping.`);
    console.log("\nDone! Seed is idempotent — no duplicates created.");
    return;
  }

  // Create main and savings wallets
  const mainWallet = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: "Main Wallet",
      type: "MAIN",
    },
  });

  const savingsWallet = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: "Savings",
      type: "SAVINGS",
    },
  });

  console.log(`Created wallets: ${mainWallet.id} (Main), ${savingsWallet.id} (Savings)`);

  // Seed an initial deposit into the main wallet
  const depositAmount = 1000.0;
  const transaction = await prisma.transaction.create({
    data: {
      type: "DEPOSIT",
      status: "COMPLETED",
      amount: depositAmount,
      description: "Initial seed deposit",
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      transactionId: transaction.id,
      walletId: mainWallet.id,
      amount: depositAmount,
      type: "CREDIT",
      runningBalance: depositAmount,
    },
  });

  await prisma.wallet.update({
    where: { id: mainWallet.id },
    data: { balance: depositAmount },
  });

  console.log(`Seeded R${depositAmount} into Main Wallet`);
  console.log("\nDone! You can now test transfers between wallets.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

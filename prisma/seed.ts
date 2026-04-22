import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const packCount = await prisma.pack.count();
  const userCount = await prisma.user.count();
  const scenarioCount = await prisma.scenario.count();
  if (false) {
    console.log('[seed] already populated, skipping');
    return;
  }

  const usersData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'public/data/users.json'), 'utf-8')
  );
  for (const user of usersData) {
    await prisma.user.upsert({
      where: { id: user.id.toString() },
      update: {},
      create: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }

  const packsData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'public/data/packs.json'), 'utf-8')
  );
  for (const pack of packsData) {
    await prisma.pack.upsert({
      where: { id: pack.id.toString() },
      update: {},
      create: {
        id: pack.id.toString(),
        name: pack.name,
        tier: pack.tier,
        price: pack.price,
        imageUrl: pack.imageUrl ?? '',
        creatorId: (pack.creatorId ?? '2').toString(),
      },
    });
  }

  const scenariosData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'public/data/scenarios.json'), 'utf-8')
  );
  for (const scenario of scenariosData) {
    if (!scenario.packId) continue;
    await prisma.scenario.upsert({
      where: { id: scenario.id.toString() },
      update: { image: scenario.image ?? null },
      create: {
        id: scenario.id.toString(),
        packId: scenario.packId.toString(),
        title: scenario.title,
        map: scenario.map ?? '',
        description: scenario.description,
        image: scenario.image ?? null,
        macro: scenario.macro ?? {},
        micro: scenario.micro ?? {},
        communication: scenario.communication ?? {},
        options: scenario.options ?? [],
      },
    });
  }

  console.log('[seed] done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

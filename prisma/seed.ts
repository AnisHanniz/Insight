import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('[seed] Starting seeding...');

  const usersData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'public/data/users.json'), 'utf-8')
  );
  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role,
        elo: user.elo || 1000,
        packsUnlocked: user.packsUnlocked || [],
        history: user.history || [],
        name: user.name,
      },
      create: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        elo: user.elo || 1000,
        packsUnlocked: user.packsUnlocked || [],
        history: user.history || [],
      },
    });
  }

  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  const defaultCreatorId = adminUser?.id;

  const packsData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'public/data/packs.json'), 'utf-8')
  );
  for (const pack of packsData) {
    await prisma.pack.upsert({
      where: { id: pack.id.toString() },
      update: {
        name: pack.name,
        theme: pack.theme || 'training',
        subtitle: pack.subtitle,
        description: pack.description,
        tier: pack.tier,
        difficulty: pack.difficulty || 'intermediate',
        price: pack.price,
        imageUrl: pack.imageUrl || '',
        isPremium: pack.isPremium || false,
        tournament: pack.tournament,
      },
      create: {
        id: pack.id.toString(),
        name: pack.name,
        theme: pack.theme || 'training',
        subtitle: pack.subtitle,
        description: pack.description,
        tier: pack.tier,
        difficulty: pack.difficulty || 'intermediate',
        price: pack.price,
        imageUrl: pack.imageUrl || '',
        isPremium: pack.isPremium || false,
        tournament: pack.tournament,
        creatorId: defaultCreatorId,
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
      update: {
        title: scenario.title,
        description: scenario.description,
        map: scenario.map || 'Any',
        image: scenario.image || null,
        videoUrl: scenario.video || null,
        theme: scenario.theme,
        subcategory: scenario.subcategory,
        overlay: scenario.overlay || null,
        macro: scenario.macro || {},
        micro: scenario.micro || {},
        communication: scenario.communication || {},
        options: scenario.options || [],
      },
      create: {
        id: scenario.id.toString(),
        packId: scenario.packId.toString(),
        title: scenario.title,
        description: scenario.description,
        map: scenario.map || 'Any',
        image: scenario.image || null,
        videoUrl: scenario.video || null,
        theme: scenario.theme,
        subcategory: scenario.subcategory,
        overlay: scenario.overlay || null,
        macro: scenario.macro || {},
        micro: scenario.micro || {},
        communication: scenario.communication || {},
        options: scenario.options || [],
      },
    });
  }

  console.log('[seed] Seeding done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const workTypes = [
    { title: 'Кладка перегородок', unit: 'м²' },
    { title: 'Монтаж опалубки', unit: 'м²' },
    { title: 'Заливка бетона', unit: 'м³' },
    { title: 'Штукатурка стен', unit: 'м²' },
    { title: 'Разводка кабеля', unit: 'пог. м' },
  ];

  console.log('Seeding work types...');
  for (const wt of workTypes) {
    await prisma.workType.upsert({
      where: { title: wt.title },
      update: {},
      create: wt,
    });
  }
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

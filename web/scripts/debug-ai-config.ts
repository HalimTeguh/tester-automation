import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.aiProviderConfig.findMany();
  console.log('=== AI Provider Configs ===');
  console.log(JSON.stringify(configs.map(c => ({ ...c, apiKey: c.apiKey ? '***' + c.apiKey.slice(-4) : '(empty)' })), null, 2));
  
  const active = await prisma.aiProviderConfig.findFirst({ where: { isActive: true } });
  console.log('\n=== Active Provider ===');
  if (active) {
    console.log('Name:', active.name);
    console.log('Provider:', active.provider);
    console.log('Base URL:', active.baseUrl);
    console.log('Model:', active.model);
    console.log('API Key exists:', !!active.apiKey);
    console.log('API Key length:', active.apiKey?.length || 0);
  } else {
    console.log('No active provider found');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);

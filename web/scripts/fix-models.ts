import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Update semua provider dengan model tidak valid ke model yang valid
  const providers = await prisma.aiProviderConfig.findMany();
  
  for (const provider of providers) {
    let newModel = provider.model;
    let newMaxTokens = provider.maxTokens;
    
    // Fix model names
    if (provider.model.toLowerCase().includes('kimi') && provider.model.includes(' ')) {
      // Convert "Kimi K2.6" -> "kimi-k2.6"
      newModel = provider.model.toLowerCase().replace(/\s+/g, '-');
    }
    
    // Fix qwen-max (not available in OpenCode)
    if (provider.model === 'qwen-max' || provider.model === 'qwen-plus') {
      newModel = 'kimi-k2.6';
    }
    
    // Update maxTokens untuk reasoning model
    if (newModel.includes('kimi') || newModel.includes('deepseek-r1')) {
      newMaxTokens = Math.max(provider.maxTokens, 12000);
    }
    
    if (newModel !== provider.model || newMaxTokens !== provider.maxTokens) {
      await prisma.aiProviderConfig.update({
        where: { id: provider.id },
        data: { model: newModel, maxTokens: newMaxTokens }
      });
      console.log(`Updated ${provider.name}: ${provider.model} -> ${newModel}, maxTokens: ${newMaxTokens}`);
    } else {
      console.log(`Skipped ${provider.name}: ${provider.model} (already valid)`);
    }
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);

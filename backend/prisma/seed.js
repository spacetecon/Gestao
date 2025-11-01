import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoriasReceita = [
  { nome: 'Salário', cor: '#10b981', icone: 'dollar-sign' },
  { nome: 'Freelance', cor: '#3b82f6', icone: 'briefcase' },
  { nome: 'Investimentos', cor: '#8b5cf6', icone: 'trending-up' },
  { nome: 'Prêmio', cor: '#f59e0b', icone: 'award' },
  { nome: 'Venda', cor: '#06b6d4', icone: 'shopping-bag' },
  { nome: 'Outros', cor: '#6b7280', icone: 'more-horizontal' },
];

const categoriasDespesa = [
  { nome: 'Alimentação', cor: '#ef4444', icone: 'utensils' },
  { nome: 'Transporte', cor: '#f97316', icone: 'car' },
  { nome: 'Moradia', cor: '#84cc16', icone: 'home' },
  { nome: 'Saúde', cor: '#ec4899', icone: 'heart' },
  { nome: 'Educação', cor: '#8b5cf6', icone: 'book' },
  { nome: 'Lazer', cor: '#06b6d4', icone: 'smile' },
  { nome: 'Compras', cor: '#f59e0b', icone: 'shopping-cart' },
  { nome: 'Contas', cor: '#6366f1', icone: 'file-text' },
  { nome: 'Investimentos', cor: '#14b8a6', icone: 'trending-up' },
  { nome: 'Outros', cor: '#6b7280', icone: 'more-horizontal' },
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar categorias padrão existentes
  await prisma.category.deleteMany({
    where: { isDefault: true }
  });

  console.log('🧹 Categorias padrão antigas removidas');

  // Criar categorias de receita
  for (const cat of categoriasReceita) {
    await prisma.category.create({
      data: {
        ...cat,
        tipo: 'receita',
        isDefault: true,
        userId: null
      }
    });
  }

  console.log(`✅ ${categoriasReceita.length} categorias de receita criadas`);

  // Criar categorias de despesa
  for (const cat of categoriasDespesa) {
    await prisma.category.create({
      data: {
        ...cat,
        tipo: 'despesa',
        isDefault: true,
        userId: null
      }
    });
  }

  console.log(`✅ ${categoriasDespesa.length} categorias de despesa criadas`);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

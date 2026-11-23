// Seed: coloca no banco os dados iniciais do site (os mesmos que antes ficavam no front-end).
// Executar com: npm run db:seed  (pode rodar várias vezes sem duplicar)
import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'

const eventos = [
  { titulo: 'Mutirão Praia Limpa', data: new Date('2026-11-08T00:00:00.000Z'), local: 'Praia Martim de Sá', descricao: 'Mutirão de limpeza com coleta seletiva e brindes para voluntários.' },
  { titulo: 'Oficina de Compostagem', data: new Date('2026-11-22T00:00:00.000Z'), local: 'Ecoponto Tinga', descricao: 'Aprenda a transformar resíduos orgânicos em adubo em casa.' },
]

const ecopontos = [
  { nome: 'Ecoponto Martim de Sá', endereco: 'Rua Cerijós, 180 - Martim de Sá, Caraguatatuba', horario: 'Seg à Sáb, das 08:30 às 17:00', descartes: 'Entulhos, Podas, Madeira, Eletrodomésticos' },
  { nome: 'Ecoponto Golfinho', endereco: 'Av. Alice de Souza Capelli, 15 - Jardim Golfinho', horario: 'Seg à Sáb, das 08:30 às 17:00', descartes: 'Eletroeletrônicos, Móveis Antigos, Vidros, Metais' },
  { nome: 'Ecoponto Tinga', endereco: 'Av. Senador Feijó, s/n - Tinga', horario: 'Seg à Sáb, das 08:30 às 17:00', descartes: 'Entulhos de Obra, Óleo de Cozinha Usado, Baterias' },
  { nome: 'Ecoponto Massaguaçu', endereco: 'Av. Antônio de Lucca, s/n - Massaguaçu', horario: 'Seg à Sáb, das 08:30 às 17:00', descartes: 'Madeiras, Podas, Recicláveis Gerais, Plásticos' },
]

const noticias = [
  { categoria: 'Campanha Ativa', titulo: 'Operação Praia Limpa Verão 2025', texto: 'Ação de conscientização com distribuição de sacolas biodegradáveis e mutirão de limpeza diário nas praias de maior movimento.', foto: '/img/card1.png', publicadoEm: new Date('2026-09-10T12:00:00.000Z') },
  { categoria: 'Educação', titulo: 'Programa de Reciclagem de Óleo de Cozinha', texto: 'Leve seu óleo usado em garrafa PET até os Ecopontos e evita a contaminação de milhares de litros de águas das nossas praias.', foto: '/img/card2.png', publicadoEm: new Date('2026-09-12T12:00:00.000Z') },
  { categoria: 'Utilidade', titulo: 'Novo Sistema de Agendamento de Grandes Volumes', texto: 'Agora você pode agendar a retirada de sofás e móveis velhos diretamente pelo portal de serviços ao cidadão de Caraguatatuba.', foto: '/img/card3.png', publicadoEm: new Date('2026-09-15T12:00:00.000Z') },
]

const perguntas = [
  { ordem: 1, pergunta: 'Como funciona a educação ambiental nos bairros de Caraguatatuba?', resposta: 'Por meio de iniciativas integradas entre a Prefeitura, escolas municipais, centros comunitários e parcerias com empresas e concessionárias.' },
  { ordem: 2, pergunta: 'Qual é a iniciativa da Prefeitura de Caraguatatuba para engajar os moradores dos bairros no aumento da cobertura vegetal e preservação da Mata Atlântica local?', resposta: 'A prefeitura desenvolve o Projeto Arborizar, uma ação conjunta das Secretarias de Urbanismo e de Meio Ambiente. O projeto distribui cartilhas educativas nas escolas e oferece o plantio planejado de mudas de árvores nativas nos bairros.' },
  { ordem: 3, pergunta: 'Como o cidadão de Caraguatatuba pode aplicar na prática os conceitos de educação ambiental no descarte de resíduos especiais e recicláveis no seu bairro?', resposta: 'O município promove a educação ambiental prática por meio dos Ecopontos (localizados em bairros estratégicos como Martim de Sá, Tinga, Golfinho e Massaguaçu).' },
]

// Insere os dados somente se a tabela ainda estiver vazia (evita duplicar)
async function inserirSeVazio(tabela, dados) {
  if ((await prisma[tabela].count()) > 0) {
    console.log(`- ${tabela}: já tem dados, mantido como está`)
    return
  }
  await prisma[tabela].createMany({ data: dados })
  console.log(`✔ ${tabela}: ${dados.length} registros criados`)
}

async function main() {
  // Cria o administrador (se já existir, não faz nada)
  const usuario = process.env.ADMIN_USER || 'admin'
  const senha = process.env.ADMIN_PASSWORD || 'admin123'
  await prisma.usuario.upsert({
    where: { usuario },
    update: {},
    create: { usuario, senhaHash: await bcrypt.hash(senha, 10) }, // 10 = custo do hash
  })
  console.log(`✔ administrador "${usuario}" pronto`)

  await inserirSeVazio('evento', eventos)
  await inserirSeVazio('ecoponto', ecopontos)
  await inserirSeVazio('noticia', noticias)
  await inserirSeVazio('pergunta', perguntas)
}

main()
  .catch((erro) => {
    console.error('Erro no seed:', erro.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect()) // fecha a conexão com o banco

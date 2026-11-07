import fs from 'node:fs';
const groups = [
['Vestuário','☀',`Bodies|8|unidades
Babygrows|8|unidades
Gorros|2|unidades
Meias ou botinhas|6|pares
Luvas de recém-nascido|2|pares
Mantas|2|unidades
Saco de dormir|1|unidade
Calças com pé|4|unidades
Conjuntos de roupa|3|conjuntos
Casacos de malha|2|unidades`],
['Alimentação','♡',`Biberões|6|unidades
Leite em pó Aptamil 1|1|lata
Termo para líquidos|1|unidade
Doseador de leite em pó|1|unidade
Bomba de leite Medela Freestyle Hands-free|1|unidade
Creme de lanolina Purelan|1|embalagem
Coletor de leite Lansinoh|1|unidade
Conchas de amamentação Medela|1|conjunto
Soutiens de amamentação|3|unidades
Pijamas de amamentação|3|unidades
Discos absorventes de amamentação|2|caixas
Fraldas de pano / paninhos de arrotar|8|unidades
Babetes de tecido|8|unidades
Almofada de amamentação Doomoo|1|unidade
Babetes de silicone|2|unidades
Babetes com mangas|2|unidades
Cadeira de papa|1|unidade`],
['Muda de fraldas','◈',`Fraldas recém-nascido / tamanho 1|2|embalagens
Toalhitas 99% água|2|embalagens
Creme muda-fraldas|2|embalagens
Muda-fraldas|1|unidade
Compressas não tecido|1|embalagem
Água de limpeza rosto e corpo|1|embalagem
Linimento Mustela|1|embalagem`],
['Sono','☾',`Berço / Chicco Next2Me Forever|1|unidade
Lençóis ajustáveis|4|unidades
Protetor de colchão|2|unidades
Luz de presença / Moonie|1|unidade
Doudou|2|unidades`],
['Banho e higiene','♧',`Banheira|1|unidade
Gel de banho bebé|1|embalagem
Champô suave|1|embalagem
Leite de limpeza|1|embalagem
Creme de rosto Hydra Bébé|1|embalagem
Creme de corpo|1|embalagem
Paninhos de banho|8|unidades
Toalhas com capuz|3|unidades
Escova e pente|1|conjunto
Tesoura ou corta-unhas|1|unidade
Termómetro|1|unidade
Lima de unhas|1|unidade`],
['Saúde e segurança','✚',`Cadeira auto|1|unidade
Base ISOFIX compatível|1|unidade
Monitor de bebé|1|unidade
Aspirador nasal|1|unidade
Kit primeiros socorros|1|conjunto
Protetor de sol para o carro|1|conjunto
Soro fisiológico monodoses|1|embalagem
Compressas esterilizadas|1|embalagem
Algodão|1|embalagem
BioGaia|1|embalagem
Bebegel|1|embalagem
Aero-OM ou Colimil|1|embalagem
Vigantol ou Nancare|1|embalagem
Ben-u-ron 75 mg|1|embalagem`],
['Passeio','↗',`Carrinho de bebé Cybex|1|unidade
Alcofa compatível|1|unidade
Sling ou marsúpio Ergobaby|1|unidade
Muda-fraldas portátil|1|unidade
Chupetas|4|unidades
Caixa para chupetas|1|unidade
Porta-chupetas de tecido|1|unidade`],
['Quarto e brincadeira','✧',`Brinquedos e mordedores|2|unidades
Livros de tecido|2|unidades
Detergente para roupa bebé|1|embalagem
Cómoda|1|unidade
Mesa de muda-fraldas|1|unidade
Cadeira para amamentar|1|unidade
Livro de memórias|1|unidade
Rockit USB|1|unidade
Espreguiçadeira Maxi-Cosi Kori|1|unidade`],
['Maternidade · mãe','▤',`Cuecas pós-parto|8|unidades
Chinelos|1|par
Produtos de higiene pessoal|1|conjunto
Robe|1|unidade
Pensos noturnos / pós-parto|1|embalagem
Toalha de banho adulto|1|unidade
Saco para roupa suja|1|unidade
Roupa para a alta|1|conjunto`],
['Acessórios Medela','◇',`Set recolha e alimentação (4 frascos + 5 sacos)|1|conjunto
Escova biberões Quick Clean|1|unidade
Tetinas fluxo lento S|2|embalagens
Tetinas fluxo médio M|2|embalagens
Mamilos silicone Contact S|2|embalagens
Mamilos silicone Contact M|2|embalagens
Almofadas de hidrogel|1|embalagem
Soutien Keep Cool Ultra|1|unidade
Frascos 250 ml (pack 2)|1|pack
Frascos 150 ml (pack 3)|1|pack
Tetina Calma|1|unidade`]
];
const state={name:'A nossa primeira aventura',budget:2500,revision:0,categories:[],items:[],packing:[],researchDate:'2026-11-07'};
for(const [name,icon,rows] of groups){const category={id:crypto.randomUUID(),name,icon};state.categories.push(category);for(const row of rows.split('\n')){const [name,quantity,unit]=row.split('|');state.items.push({id:crypto.randomUUID(),name,quantity:+quantity,unit,category:category.id,status:'todo',priority:'normal',notes:'',offers:[],selectedOffer:null,paid:null});}}
for(const item of state.items){
 if(/BioGaia|Bebegel|Aero-OM|Vigantol|Ben-u-ron|primeiros socorros/.test(item.name)){item.priority='optional';item.notes='Da lista de referência. Confirmar necessidade e produto com o pediatra; não é uma recomendação de tratamento.';}
 if(/Medela|Doseador|Leite em pó/.test(item.name))item.notes+=' Quantidade de referência; adaptar ao plano de alimentação. Acessórios podem já estar incluídos na bomba.';
 if(/Lençóis|colchão/.test(item.name))item.notes='Confirmar medidas e compatibilidade com o berço escolhido.';
 if(/Doudou/.test(item.name))item.notes='Artigo para companhia; não colocar no espaço de sono do recém-nascido.';
}
const packing=[['Sala de parto','Camisa de noite com abertura à frente',1],['Sala de parto','Cuecas',2],['Sala de parto','Chinelos',1],['Sala de parto','Conjunto de roupa interior com calça',1],['Sala de parto','Babygrow',1],['Sala de parto','Casaco de malha',1],['Sala de parto','Gorro e luvas',2],['Sala de parto','Meias ou carapins',1],['Sala de parto','Manta',1],['Sala de parto','Fralda de pano',1],['Sala de parto','Fralda descartável',1],['Puerpério · mãe','Pijamas com abertura à frente',3],['Puerpério · mãe','Cuecas',6],['Puerpério · mãe','Chinelos',1],['Puerpério · mãe','Higiene pessoal',1],['Puerpério · mãe','Robe',1],['Puerpério · mãe','Soutiens de amamentação',2],['Puerpério · mãe','Creme e discos / conchas',1],['Puerpério · mãe','Pensos noturnos',1],['Puerpério · mãe','Toalha',1],['Puerpério · mãe','Saco para roupa suja',1],['Puerpério · mãe','Roupa para alta',1],['Puerpério · bebé','Mudas de roupa',4],['Puerpério · bebé','Roupa interior com calça',3],['Puerpério · bebé','Casacos de malha',2],['Puerpério · bebé','Meias',3],['Puerpério · bebé','Fraldas de pano',4],['Puerpério · bebé','Fraldas descartáveis (8–10/dia, referência original)',1],['Puerpério · bebé','Toalha',1],['Puerpério · bebé','Pente, escova e lima',1],['Puerpério · bebé','Toalhitas',1]];
state.packing=packing.map(([group,name,quantity])=>({id:crypto.randomUUID(),group,name,quantity,done:false}));
fs.writeFileSync('data/seed.json',JSON.stringify(state,null,2));
console.log(`${state.items.length} artigos; ${state.packing.length} entradas na mala.`);

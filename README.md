# Ninho — a nossa lista de bebé

Webapp mobile em **PHP 8.2+, MySQL 8 e JavaScript sem framework**. Lista inicial adaptada de [Lista_do_Lopinho.docx](Lista_do_Lopinho.docx), com as compras da outra família a zero.

## Configurar a password e instalar no alojamento

1. Copiar [config.example.php](config.example.php) para **`config.local.php`**, na raiz do projeto (ao lado deste README).
2. Em `config.local.php`, preencher **`DB_PASSWORD` com a password da base de dados** e `APP_PASSWORD` com uma password da família de pelo menos 12 caracteres. Esta última serve para entrar na aplicação, não é a password do MySQL.
3. O utilizador e a base de dados já estão definidos como **`nunomor7_baby`**. `DB_HOST` é `localhost`; alterar apenas se o alojamento indicar outro servidor.
4. Ativar a extensão PHP `pdo_mysql`. Atribuir ao utilizador permissões na base de dados. A base de dados deve existir antes da instalação.
5. Executar na raiz: `php scripts/install.php`. Cria as tabelas e importa a lista; repetir não substitui uma lista existente. Se não tiveres terminal, importar [data/install.sql](data/install.sql) no phpMyAdmin, dentro da base `nunomor7_baby`.
6. Configurar a raiz pública do domínio/subdomínio para a pasta **`public/`**. Ativar HTTPS. Abrir o endereço e entrar com `APP_PASSWORD`.

`config.local.php` e `.env` estão no `.gitignore`: **nunca enviar passwords para o GitHub**. O ficheiro de exemplo fica com campos vazios. As credenciais são lidas apenas no servidor.

### Alojamento cPanel sem alteração da raiz pública

Colocar a pasta completa em `public_html/baby/` e abrir `https://o-teu-dominio/baby/public/`. O `.htaccess` da raiz bloqueia a consulta das pastas internas e do ficheiro de configuração em Apache 2.4 com `mod_rewrite` e `AllowOverride` ativos. A opção preferida é criar um subdomínio cuja raiz seja `baby/public`. Não publicar a raiz inteira num servidor que ignore `.htaccess`.

No cPanel, selecionar **PHP 8.2 ou superior para o próprio domínio/subdomínio**, com `pdo_mysql` ativo; a versão do terminal pode ser diferente. A API devolve um erro explícito se a versão web for demasiado antiga. Os módulos JavaScript públicos usam `.js`, para serem servidos com o tipo MIME JavaScript mesmo em alojamentos que não reconhecem `.mjs`. Se o ecrã ficar em “A preparar o vosso ninho…”, verificar na consola do navegador se há erros de carregamento dos módulos.

### Docker

Copiar [.env.example](.env.example) para `.env` e alterar as três passwords. Não usar `config.local.php` com Docker (as variáveis de ambiente já configuram o acesso ao serviço `db`).

```sh
docker compose up -d --build
docker compose exec web php scripts/install.php
```

Abrir `http://localhost:8080`. MySQL fica numa rede interna e num volume persistente. A porta web está limitada ao computador local; para alojar publicamente, configurar o servidor/proxy com HTTPS.

### PHP instalado localmente

Depois de configurar e importar a base de dados:

```sh
php -S 127.0.0.1:8080 -t public
```

## Funcionalidades

- 100 artigos em 10 categorias; quantidades, unidades, notas, prioridades e estados editáveis.
- Adicionar/eliminar artigos; mover entre categorias; reordenar artigos e categorias; criar/renomear/eliminar categorias movendo os artigos.
- Ofertas com loja, produto/variante, preço por pack, quantidade por pack, fonte e data. Escolher oferta e acrescentar preços manualmente.
- Subtotal por comprar com arredondamento para packs inteiros; total efetivamente pago separado de estimativas; artigos sem preço explicitamente excluídos.
- Checklist independente da mala de maternidade, sem duplicar custos no orçamento.
- Pesquisa, filtros, exportação CSV e cópia JSON.
- Uma lista familiar partilhada protegida por password. Sessões, CSRF, limitação de tentativas de login e validação no servidor.
- Gravação no MySQL com versão otimista: alterações concorrentes não sobrescrevem silenciosamente a lista. Se houver conflito, a alteração é rejeitada e deve ser repetida após recarregar.

## Preços e estudo de mercado

Ver [ESTUDO-DE-MERCADO.md](ESTUDO-DE-MERCADO.md) e o separador **Comparar preços**. Consulta em 07/11/2026 de páginas públicas e resultados indexados. Não existe atualização automática de preços. Alguns resultados podem estar em cache; confirmar preços, variantes e disponibilidade na loja. Portes e vantagens em cartão não entram no orçamento.

Ofertas com modelos diferentes são alternativas, não produtos idênticos. Atenção às medidas do berço e às compatibilidades de cadeira auto, base e carrinho. Produtos em conjuntos podem sobrepor outros artigos: ajustar a lista antes de somar.

As quantidades são referências do documento, não necessidades universais. Medicamentos e suplementos foram conservados como opcionais para confirmar com o profissional de saúde; a aplicação não inclui instruções de tratamento.

## Demonstração

`http://localhost:8080/?demo` usa os mesmos ecrãs com armazenamento apenas no navegador. Apresenta um aviso permanente. Não sincroniza com MySQL nem copia alterações para a lista real. A versão normal nunca muda silenciosamente para armazenamento local em caso de erro.

## Desenvolvimento e testes

```sh
node --test tests/model.test.mjs
node --test tests/http.test.mjs
php tests/validation.php
php -l public/api.php
```

O teste HTTP inicia um servidor PHP local temporário, sem usar MySQL, e verifica o carregamento dos módulos e o diagnóstico de versão PHP. Pode selecionar o executável com `PHP_BINARY`.

Os dados iniciais são gerados por `node scripts/build-data.mjs`, `node scripts/market-data.mjs` e `node scripts/package-data.mjs`. Isto altera apenas os ficheiros de instalação, não uma base de dados já instalada. O esquema mantém o documento familiar em JSON MySQL, com atualização atómica e controlo de versão.

O teste `node tests/integration.mjs` necessita de uma instância MySQL **exclusiva de testes** em localhost:3307 com utilizador root sem password. Cria e elimina apenas uma base aleatória com prefixo `ninho_test_`. Valida instalação, sessão, CSRF, persistência, conflito de versões, rejeição de dados inválidos e logout. Pode configurar `PHP_BINARY`, `PHP_EXTENSION_DIR`, `MYSQL_BINARY` e `TEST_MYSQL_PORT`. Nunca executar contra uma base de produção.

Guardar cópias regulares da base de dados. O JSON exportado é também uma cópia legível da lista; a interface não inclui importação automática. A aplicação foi pensada para uma família, sem contas individuais ou permissões por membro.

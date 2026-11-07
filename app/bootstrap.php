<?php
declare(strict_types=1);
$local = dirname(__DIR__) . '/config.local.php';
$config = is_file($local) ? require $local : [];
function setting(string $key, string $fallback = ''): string {
    global $config;
    return (string) (getenv($key) !== false ? getenv($key) : ($config[$key] ?? $fallback));
}
function db(): PDO {
    static $db;
    if ($db) return $db;
    $db = new PDO('mysql:host='.setting('DB_HOST','localhost').';port='.setting('DB_PORT','3306').';dbname='.setting('DB_NAME','nunomor7_baby').';charset=utf8mb4', setting('DB_USER','nunomor7_baby'), setting('DB_PASSWORD'), [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES=>false]);
    return $db;
}
function reply(array $data, int $code=200): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}
function validateState(array $s): void {
    if (!is_string($s['name']??null) || strlen($s['name'])>150 || trim($s['name'])==='' || !is_numeric($s['budget']??null) || $s['budget']<0 || $s['budget']>10000000) throw new InvalidArgumentException('Nome ou orçamento inválido.');
    foreach (['categories','items','packing'] as $key) if (!isset($s[$key]) || !is_array($s[$key]) || !array_is_list($s[$key]) || count($s[$key])>2000) throw new InvalidArgumentException('Lista inválida.');
    $ids=[]; $cats=[];
    foreach ($s['categories'] as $c) { validateEntry($c,$ids); $cats[]=$c['id']; if (!is_string($c['icon']??null)||strlen($c['icon'])>16) throw new InvalidArgumentException('Ícone inválido.'); }
    if (!$cats) throw new InvalidArgumentException('É necessária uma categoria.');
    foreach ($s['items'] as $i) {
        validateEntry($i,$ids);
        if (!in_array($i['category']??null,$cats,true) || !in_array($i['status']??null,['todo','bought','gift','skip'],true) || !in_array($i['priority']??null,['normal','essential','optional'],true)) throw new InvalidArgumentException('Categoria ou estado inválido.');
        if (!is_int($i['quantity']??null)||$i['quantity']<1||$i['quantity']>10000 || !is_string($i['unit']??null)||strlen($i['unit'])>100 || !is_string($i['notes']??null)||strlen($i['notes'])>5000) throw new InvalidArgumentException('Quantidade ou notas inválidas.');
        if (($i['paid']??null)!==null && (!is_numeric($i['paid'])||$i['paid']<0||$i['paid']>10000000)) throw new InvalidArgumentException('Valor pago inválido.');
        if (!is_array($i['offers']??null)||!array_is_list($i['offers'])||count($i['offers'])>50) throw new InvalidArgumentException('Ofertas inválidas.');
        $offers=[];
        foreach($i['offers'] as $o) {
            validateEntry($o,$offers);
            if (!is_string($o['store']??null)||strlen($o['store'])>150 || !filter_var($o['url']??'',FILTER_VALIDATE_URL)||!in_array(strtolower(parse_url($o['url'],PHP_URL_SCHEME)??''),['https','http'],true)) throw new InvalidArgumentException('Ligação de loja inválida.');
            if (($o['price']??null)!==null && (!is_numeric($o['price'])||$o['price']<0||$o['price']>10000000)) throw new InvalidArgumentException('Preço inválido.');
            if (!is_int($o['pack']??null)||$o['pack']<1||$o['pack']>10000 || !in_array($o['kind']??null,['observed','manual','unverified'],true) || !is_string($o['date']??null) || !preg_match('/^\d{4}-\d{2}-\d{2}$/',$o['date'])) throw new InvalidArgumentException('Dados da oferta inválidos.');
        }
        if (($i['selectedOffer']??null)!==null && !in_array($i['selectedOffer'],$offers,true)) throw new InvalidArgumentException('Oferta escolhida inválida.');
    }
    foreach($s['packing'] as $p) { validateEntry($p,$ids); if (!is_bool($p['done']??null)||!is_string($p['group']??null)||strlen($p['group'])>150||!is_int($p['quantity']??null)||$p['quantity']<1||$p['quantity']>10000) throw new InvalidArgumentException('Entrada da mala inválida.'); }
}
function validateEntry(mixed $entry,array &$ids): void {
    if (!is_array($entry)||!is_string($entry['id']??null)||!preg_match('/^[a-zA-Z0-9-]{1,80}$/',$entry['id'])||in_array($entry['id'],$ids,true)||!is_string($entry['name']??null)||trim($entry['name'])===''||strlen($entry['name'])>250) throw new InvalidArgumentException('Nome ou identificador inválido.');
    $ids[]=$entry['id'];
}

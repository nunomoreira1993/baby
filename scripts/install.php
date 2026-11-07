<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit;
require __DIR__.'/../app/bootstrap.php';
$db=db();
$db->exec('CREATE TABLE IF NOT EXISTS family_list (id INT PRIMARY KEY, revision INT NOT NULL DEFAULT 0, document JSON NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
$db->exec('CREATE TABLE IF NOT EXISTS login_attempts (client_hash CHAR(64) PRIMARY KEY, attempts INT NOT NULL, last_attempt BIGINT NOT NULL)');
$state=json_decode(file_get_contents(__DIR__.'/../data/seed.json'),true,512,JSON_THROW_ON_ERROR);
validateState($state);
$db->prepare('INSERT IGNORE INTO family_list (id, revision, document) VALUES (1, 0, ?)')->execute([json_encode($state,JSON_UNESCAPED_UNICODE)]);
echo "Base de dados pronta. Uma lista existente nunca é substituída.\n";

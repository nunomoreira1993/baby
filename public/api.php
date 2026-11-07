<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
if (PHP_VERSION_ID < 80200) {
    http_response_code(503);
    error_log('Ninho requires PHP 8.2 or newer.');
    echo json_encode(['error'=>'A aplicação requer PHP 8.2 ou superior. Altera a versão de PHP do domínio no alojamento.'], JSON_UNESCAPED_UNICODE);
    exit;
}
require __DIR__.'/../app/bootstrap.php';
ini_set('session.use_strict_mode','1');
session_name('ninho_session');
session_set_cookie_params(['httponly'=>true,'secure'=>!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off','samesite'=>'Strict','path'=>'/']);
session_start();
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
try {
    $action=$_GET['action']??'state'; $method=$_SERVER['REQUEST_METHOD'];
    if (!in_array($method,['GET','POST'],true)) reply(['error'=>'Método não permitido.'],405);
    if ($method==='POST' && !hash_equals($_SESSION['csrf'],$_SERVER['HTTP_X_CSRF_TOKEN']??'')) reply(['error'=>'Sessão expirada. Atualiza a página.'],403);
    if ((int)($_SERVER['CONTENT_LENGTH']??0)>2000000) reply(['error'=>'A lista é demasiado grande.'],413);
    $raw=$method==='POST'?file_get_contents('php://input',false,null,0,2000001):'{}';
    if(strlen($raw)>2000000) reply(['error'=>'A lista é demasiado grande.'],413);
    $body=json_decode($raw,true,512,JSON_THROW_ON_ERROR);
    if (!is_array($body)) reply(['error'=>'Pedido inválido.'],422);
    if ($action==='session'&&$method==='GET') reply(['authenticated'=>!empty($_SESSION['auth']),'csrf'=>$_SESSION['csrf'],'configured'=>strlen(setting('APP_PASSWORD'))>=12]);
    if ($action==='login'&&$method==='POST') {
        if (strlen(setting('APP_PASSWORD'))<12) reply(['error'=>'Configura APP_PASSWORD com pelo menos 12 caracteres no servidor.'],503);
        $db=db(); $key=hash('sha256',$_SERVER['REMOTE_ADDR']??'local');
        $db->beginTransaction();
        $db->prepare('INSERT IGNORE INTO login_attempts VALUES (?,0,0)')->execute([$key]);
        $q=$db->prepare('SELECT * FROM login_attempts WHERE client_hash=? FOR UPDATE');$q->execute([$key]);$attempt=$q->fetch(PDO::FETCH_ASSOC);
        $count=time()-(int)$attempt['last_attempt']>900?0:(int)$attempt['attempts'];
        if ($count>=10) {$db->commit();reply(['error'=>'Demasiadas tentativas. Aguarda 15 minutos.'],429);}
        if (!is_string($body['password']??null)||!hash_equals(setting('APP_PASSWORD'),$body['password'])) {
            $db->prepare('UPDATE login_attempts SET attempts=?,last_attempt=? WHERE client_hash=?')->execute([$count+1,time(),$key]);$db->commit();reply(['error'=>'Palavra-passe incorreta.'],401);
        }
        $db->prepare('DELETE FROM login_attempts WHERE client_hash=?')->execute([$key]);$db->commit();session_regenerate_id(true);$_SESSION['auth']=true;reply(['ok'=>true]);
    }
    if (empty($_SESSION['auth'])) reply(['error'=>'Entra para aceder à tua lista.'],401);
    if ($action==='logout'&&$method==='POST') {$_SESSION=[];session_destroy();reply(['ok'=>true]);}
    if($action!=='state') reply(['error'=>'Operação desconhecida.'],404);
    $db=db();
    if($method==='GET') {$row=$db->query('SELECT revision,document FROM family_list WHERE id=1')->fetch(PDO::FETCH_ASSOC);if(!$row)reply(['error'=>'Executa scripts/install.php para preparar a lista.'],503);$state=json_decode($row['document'],true);$state['revision']=(int)$row['revision'];reply(['state'=>$state]);}
    $state=$body['state']??[];validateState($state);
    if(!is_int($state['revision']??null)||$state['revision']<0) reply(['error'=>'Versão inválida.'],422);
    $q=$db->prepare('UPDATE family_list SET document=?,revision=revision+1 WHERE id=1 AND revision=?');
    $q->execute([json_encode($state,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),$state['revision']]);
    if($q->rowCount()!==1)reply(['error'=>'A lista mudou noutro dispositivo. Recarrega para receber a versão mais recente; esta alteração não foi guardada.'],409);
    reply(['revision'=>$state['revision']+1]);
} catch (InvalidArgumentException|JsonException $e) {reply(['error'=>$e->getMessage()],422);} catch(Throwable $e) {error_log($e->getMessage());reply(['error'=>'Não foi possível aceder à base de dados. Confirma a configuração e a instalação.'],503);}

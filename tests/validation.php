<?php
require __DIR__.'/../app/bootstrap.php';
$seed=json_decode(file_get_contents(__DIR__.'/../data/seed.json'),true,512,JSON_THROW_ON_ERROR);
validateState($seed);
$cases=[
 'quantidade negativa'=>function(&$s){$s['items'][0]['quantity']=-1;},
 'categoria inexistente'=>function(&$s){$s['items'][0]['category']='missing';},
 'URL executável'=>function(&$s){$s['items'][0]['offers'][0]['url']='javascript:alert(1)';},
 'pack zero'=>function(&$s){$s['items'][0]['offers'][0]['pack']=0;},
 'preço negativo'=>function(&$s){$s['items'][0]['offers'][0]['price']=-3;},
 'estado desconhecido'=>function(&$s){$s['items'][0]['status']='bad';},
 'identificador duplicado'=>function(&$s){$s['items'][1]['id']=$s['items'][0]['id'];},
 'oferta escolhida inexistente'=>function(&$s){$s['items'][0]['selectedOffer']='bad';},
 'mala inválida'=>function(&$s){$s['packing'][0]['done']='false';},
];
foreach($cases as $name=>$mutate){$s=$seed;$mutate($s);try{validateState($s);fwrite(STDERR,"FALHOU: $name\n");exit(1);}catch(InvalidArgumentException $e){echo "OK: $name\n";}}
echo "Validação da lista inicial e 9 casos inválidos passaram.\n";

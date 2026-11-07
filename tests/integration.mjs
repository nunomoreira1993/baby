import {spawn,spawnSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
const php=process.env.PHP_BINARY||'php',mysql=process.env.MYSQL_BINARY||'mysql';
const name='ninho_test_'+randomBytes(6).toString('hex'),port=18081;
const env={...process.env,DB_HOST:'127.0.0.1',DB_PORT:process.env.TEST_MYSQL_PORT||'3307',DB_NAME:name,DB_USER:'root',DB_PASSWORD:'',APP_PASSWORD:randomBytes(24).toString('hex')};
const sql=q=>{const r=spawnSync(mysql,['--no-defaults','--host=127.0.0.1','--port='+env.DB_PORT,'--user=root','--execute='+q],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);};
const args=process.env.PHP_EXTENSION_DIR?['-d','extension_dir='+process.env.PHP_EXTENSION_DIR,'-d','extension=pdo_mysql']:[];
let server;
try {
 sql('CREATE DATABASE '+name+' CHARACTER SET utf8mb4');
 const install=spawnSync(php,[...args,'scripts/install.php'],{env,encoding:'utf8'});assert.equal(install.status,0,install.stderr);
 server=spawn(php,[...args,'-S','127.0.0.1:'+port,'-t','public'],{env,stdio:'ignore'});
 let cookie='',csrf='';
 async function request(action,body,token=csrf){const r=await fetch(`http://127.0.0.1:${port}/api.php?action=${action}`,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':token},body:body?JSON.stringify(body):undefined});const set=r.headers.get('set-cookie');if(set)cookie=set.split(';')[0];return {status:r.status,data:await r.json()};}
 for(let n=0;n<40;n++){try{const r=await request('session');csrf=r.data.csrf;break;}catch{await new Promise(r=>setTimeout(r,100));}}
 assert.ok(csrf);
 assert.equal((await request('state')).status,401);
 assert.equal((await request('login',{password:env.APP_PASSWORD},'bad-token')).status,403);
 assert.equal((await request('login',{password:'wrong-password'})).status,401);
 assert.equal((await request('login',{password:env.APP_PASSWORD})).status,200);
 const initial=(await request('state')).data.state;assert.equal(initial.items.length,100);
 const state=structuredClone(initial);state.items[0].notes='Teste de persistência € <script>texto</script>';state.items[0].status='bought';state.items[0].paid=12.34;
 let r=await request('state',{state});assert.equal(r.status,200);assert.equal(r.data.revision,1);
 const saved=(await request('state')).data.state;assert.equal(saved.items[0].notes,state.items[0].notes);assert.equal(saved.items[0].paid,12.34);
 assert.equal((await request('state',{state:initial})).status,409);
 const invalid=structuredClone(saved);invalid.items[0].offers[0].url='javascript:alert(1)';assert.equal((await request('state',{state:invalid})).status,422);
 const again=spawnSync(php,[...args,'scripts/install.php'],{env,encoding:'utf8'});assert.equal(again.status,0,again.stderr);assert.equal((await request('state')).data.state.revision,1);
 assert.equal((await request('logout',{})).status,200);assert.equal((await request('state')).status,401);
 console.log('PASS: instalação idempotente, login, CSRF, MySQL, gravação, versão concorrente, validação e logout.');
}finally{server?.kill();sql('DROP DATABASE IF EXISTS '+name);}

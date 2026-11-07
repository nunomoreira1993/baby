import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {createServer} from 'node:net';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';

test('módulos públicos carregam como JavaScript e a API verifica a versão PHP',async()=>{
 const php=process.env.PHP_BINARY||'php';
 const version=spawnSync(php,['-r','echo PHP_VERSION_ID;'],{encoding:'utf8'});
 assert.equal(version.status,0,version.error?.message||version.stderr);
 const socket=createServer();
 socket.listen(0,'127.0.0.1');
 await once(socket,'listening');
 const port=socket.address().port;
 await new Promise((resolve,reject)=>socket.close(err=>err?reject(err):resolve()));
 const server=spawn(php,['-S',`127.0.0.1:${port}`,'-t','public'],{cwd:fileURLToPath(new URL('../',import.meta.url)),stdio:['ignore','ignore','pipe']});
 let errors='';
 server.stderr.on('data',data=>errors+=data);
 const base=`http://127.0.0.1:${port}/`;
 try {
  let response;
  for(let n=0;n<50;n++){
   try {response=await fetch(base);break;}
   catch(err){if(server.exitCode!==null)throw Error(errors||err.message);await new Promise(resolve=>setTimeout(resolve,100));}
  }
  assert.ok(response,'O servidor PHP não iniciou: '+errors);
  const html=await response.text();
  const script=html.match(/<script type="module" src="([^"]+)"/)[1];
  const app=await fetch(new URL(script,base));
  assert.equal(app.status,200);
  assert.match(app.headers.get('content-type')||'',/^(application|text)\/javascript\b/);
  const imports=[...(await app.text()).matchAll(/from\s+['"]([^'"]+)['"]/g)];
  assert.ok(imports.length>0);
  for(const [,path] of imports){
   const module=await fetch(new URL(path,app.url));
   assert.equal(module.status,200);
   assert.match(module.headers.get('content-type')||'',/^(application|text)\/javascript\b/);
   await module.text();
  }
  const session=await fetch(new URL('api.php?action=session',base));
  const data=await session.json();
  if(Number(version.stdout)<80200){
   assert.equal(session.status,503);
   assert.match(data.error,/PHP 8\.2/);
  }else{
   assert.equal(session.status,200);
   assert.equal(data.authenticated,false);
   assert.equal(typeof data.csrf,'string');
  }
 }finally{
  if(server.exitCode===null){
   const exited=once(server,'exit');
   server.kill();
   await exited;
  }
 }
});

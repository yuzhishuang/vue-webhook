let http = require('http');
let crypto = require('crypto');
var spawn = require('child_process').spawn;
let sendMail = require('./sendMail');
const SECRET = 'yuzhishuang';
function sign (data) {
  return 'sha1=' + crypto.createHmac('sha1', SECRET).update(data).digest('hex')
}
let server = http.createServer(function(req,res){
  console.log(req.method,req.url);
  if(req.url == '/webhook' && req.method =='POST'){
    let buffers = []; 
    req.on('data',function(data){
      console.log('on---on')
      buffers.push(data);
    });
    req.on('end',function(){
      console.log('end----end')
      let body = Buffer.concat(buffers);
      console.log(1)
      let sig   = req.headers['x-hub-signature'];
      console.log(2)
      let event = req.headers['x-github-event'];
      console.log(3)
      if(sig !== sign(body)){
        console.log('-------')
        return res.end('Not Allowed');
      }
      console.log(4)
      res.setHeader('Content-Type','application/json');
      console.log(5)
      res.end(JSON.stringify({"ok":true}));
      console.log(6)
      //===========分割线===================
      console.log(event, 'event')
      if(event === 'push'){
        console.log('进来')
        let payload = JSON.parse(body);
        console.log(payload, '===')
        let child = spawn('sh', [`./${payload.repository.name}.sh`]);
        let buffers = [];
        child.stdout.on('data', function (buffer) { buffers.push(buffer)});
        child.stdout.on('end', function () {
          let logs = Buffer.concat(buffers).toString();
          sendMail(`
            <h1>部署日期: ${new Date()}</h1>
            <h2>部署人: ${payload.pusher.name}</h2>
            <h2>部署邮箱: ${payload.pusher.email}</h2>
            <h2>提交信息: ${payload.head_commit&&payload.head_commit['message']}</h2>
            <h2>布署日志: ${logs.replace("\r\n",'<br/>')}</h2>
        `);
        });
      }
    });
  }else{
    res.end('Now Found!');
  }
});
server.listen(4000,()=>{
  console.log('服务正在4000端口上启动!');
});
import net from 'node:net';
export const APPLICATION_ID='bsece-board-reviewer';
/** Reserve a random local TCP port briefly; the child must still be checked for identity. */
export async function chooseLoopbackPort(){
 const server=net.createServer();
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  return server.address().port;
 }finally{await new Promise(resolve=>server.close(resolve));}
}
export function matchesOwnedHealth(status,identity=APPLICATION_ID,expectedNonce){
 return !!status && typeof status==='object' && status.status==='ok' && status.application===identity
  && (expectedNonce===undefined || status.qaNonce===expectedNonce);
}
export function processIsAlive(child){return !!child && child.exitCode===null && child.signalCode===null;}
export function isCheckSuccessful(check){return check?.status==='pass';}
export function automatedSmokeIsSuccessful(report){
 return report.packageLockMatches === true && report.processOwnership === 'verified' &&
 ['installedTypecheck','fullBuild','browserSmoke'].every(k=>isCheckSuccessful(report[k]));
}

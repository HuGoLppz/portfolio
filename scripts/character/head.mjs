import {toPx,toPy,adjacency} from './geo.mjs';
// regions: 0 other, 1 hair, 2 face, 3 ear
export function classifyHead(pos){
  const n=pos.length/3, reg=new Uint8Array(n);
  let zmin=1e9,zmax=-1e9;
  for(let i=0;i<n;i++){const py=toPy(pos[i*3+1]);if(py<300){zmin=Math.min(zmin,pos[i*3+2]);zmax=Math.max(zmax,pos[i*3+2]);}}
  console.log('head z range',zmin,zmax);
  const zc=(zmin+zmax)/2;
  for(let i=0;i<n;i++){
    const px=toPx(pos[i*3]),py=toPy(pos[i*3+1]),z=pos[i*3+2];
    if(py>=336)continue;
    const dx=Math.abs(px-510);
    const faceW= py<=292?114:Math.max(72,114-(py-292)*3);
    if(py>=188&&dx<=faceW&&z>zc+0.02){reg[i]=2;continue;}
    if(py>=222&&py<=306&&dx>=100&&dx<=150&&z>zc-0.09&&z<zc+0.09){reg[i]=3;continue;}
    if(py>=300&&z>zc-0.12){reg[i]=0;continue;}   // borde de la capucha, no pelo
    reg[i]=(py>=322)?0:1;
  }
  return reg;
}
export function taubin(pos,nb,mask,iters,lam=0.5,mu=-0.53){
  const n=pos.length/3;const tmp=new Float32Array(pos.length);
  for(let it=0;it<iters;it++){
    for(const f of [lam,mu]){
      tmp.set(pos);
      for(let i=0;i<n;i++){
        if(!mask[i])continue;const N=nb[i];if(!N.length)continue;
        let sx=0,sy=0,sz=0;for(const j of N){sx+=pos[j*3];sy+=pos[j*3+1];sz+=pos[j*3+2];}
        const k=1/N.length;
        tmp[i*3]=pos[i*3]+f*(sx*k-pos[i*3]);tmp[i*3+1]=pos[i*3+1]+f*(sy*k-pos[i*3+1]);tmp[i*3+2]=pos[i*3+2]+f*(sz*k-pos[i*3+2]);
      }
      pos.set(tmp);
    }
  }
}

// ring distance (graph BFS) from vertices where mask==0
export function ringDist(nb,mask,max=12){
  const n=mask.length,d=new Int16Array(n).fill(max);const q=[];
  for(let i=0;i<n;i++)if(!mask[i]){d[i]=0;q.push(i);}
  for(let h=0;h<q.length;h++){const i=q[h];if(d[i]>=max)continue;for(const j of nb[i])if(d[j]>d[i]+1){d[j]=d[i]+1;q.push(j);}}
  return d;
}
const sstep=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
export function hairShell(pos,nb,hair,C,{AZ=40,EL=20,pct=0.8,blur=2,mix=0.85,ramp=7}={}){
  const n=pos.length/3;
  const bins=Array.from({length:AZ*EL},()=>[]);
  const info=new Array(n);
  for(let i=0;i<n;i++){
    if(!hair[i])continue;
    const dx=pos[i*3]-C[0],dy=pos[i*3+1]-C[1],dz=pos[i*3+2]-C[2];
    const r=Math.hypot(dx,dy,dz);const az=Math.atan2(dx,dz);const el=Math.asin(dy/r);
    const a=((az+Math.PI)/(2*Math.PI))*AZ, e=((el+Math.PI/2)/Math.PI)*EL;
    info[i]=[dx/r,dy/r,dz/r,r,a,e];
    bins[Math.min(EL-1,Math.floor(e))*AZ+Math.min(AZ-1,Math.floor(a))%AZ].push(r);
  }
  let R=new Float32Array(AZ*EL).fill(NaN);
  bins.forEach((b,k)=>{if(b.length){b.sort((x,y)=>x-y);R[k]=b[Math.floor((b.length-1)*pct)];}});
  // fill + blur
  const blurOnce=(src)=>{const o=new Float32Array(src.length);for(let e=0;e<EL;e++)for(let a=0;a<AZ;a++){let s=0,w=0;for(let de=-blur;de<=blur;de++)for(let da=-blur;da<=blur;da++){const ee=e+de;if(ee<0||ee>=EL)continue;const v=src[ee*AZ+((a+da+AZ)%AZ)];if(Number.isNaN(v))continue;const ww=1/(1+de*de+da*da);s+=v*ww;w+=ww;}o[e*AZ+a]=w?s/w:NaN;}return o;};
  R=blurOnce(R);R=blurOnce(R);
  const rd=ringDist(nb,hair,ramp);
  for(let i=0;i<n;i++){
    if(!hair[i])continue;
    const [ux,uy,uz,r,a,e]=info[i];
    // bilinear sample of R
    const ai=Math.floor(a-0.5),ei=Math.floor(e-0.5),fa=a-0.5-ai,fe=e-0.5-ei;
    const g=(ee,aa)=>{ee=Math.min(EL-1,Math.max(0,ee));const v=R[ee*AZ+((aa%AZ)+AZ)%AZ];return Number.isNaN(v)?r:v;};
    const Rv=(1-fe)*((1-fa)*g(ei,ai)+fa*g(ei,ai+1))+fe*((1-fa)*g(ei+1,ai)+fa*g(ei+1,ai+1));
    const w=mix*sstep(0,ramp,rd[i]);
    const nr=r+(Rv-r)*w;
    pos[i*3]=C[0]+ux*nr;pos[i*3+1]=C[1]+uy*nr;pos[i*3+2]=C[2]+uz*nr;
  }
}

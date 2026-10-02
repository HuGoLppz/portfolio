// Geometry pipeline: clean -> warp -> hair smooth -> returns {idx,pos}
import {loadGLB} from './lib.mjs';
export const Y1=0.9605, SC=1495/(0.9605+1.0001), TY=5, CX=512;
export const toPx=(x)=>CX+x*SC, toPy=(y)=>TY+(Y1-y)*SC;
export const fromPx=(px)=>(px-CX)/SC, fromPy=(py)=>Y1-(py-TY)/SC;

export function cleanMesh({idx,pos}){
  const n=pos.length/3;
  const keep=[];
  for(let t=0;t<idx.length;t+=3){
    const [a,b,c]=[idx[t],idx[t+1],idx[t+2]];
    const d=(p,q)=>Math.hypot(pos[p*3]-pos[q*3],pos[p*3+1]-pos[q*3+1],pos[p*3+2]-pos[q*3+2]);
    if(d(a,b)>0.15||d(b,c)>0.15||d(a,c)>0.15)continue;
    keep.push(a,b,c);
  }
  // connected components via union-find, keep big ones
  const par=new Int32Array(n).map((_,i)=>i);
  const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x];}return x;};
  for(let t=0;t<keep.length;t+=3){const a=f(keep[t]);for(let k=1;k<3;k++){const b=f(keep[t+k]);if(a!==b)par[b]=a;}}
  const cnt=new Map();for(let t=0;t<keep.length;t++){const r=f(keep[t]);cnt.set(r,(cnt.get(r)||0)+1);}
  const out=[];
  for(let t=0;t<keep.length;t+=3){if(cnt.get(f(keep[t]))>=3*300)out.push(keep[t],keep[t+1],keep[t+2]);}
  // compact
  const map=new Int32Array(n).fill(-1);let m=0;const np=[];
  const idx2=out.map(i=>{if(map[i]<0){map[i]=m++;np.push(pos[i*3],pos[i*3+1],pos[i*3+2]);}return map[i];});
  return {idx:Uint32Array.from(idx2),pos:Float32Array.from(np)};
}

export function adjacency(idx,n){
  const nb=Array.from({length:n},()=>new Set());
  for(let t=0;t<idx.length;t+=3){for(let k=0;k<3;k++){const a=idx[t+k],b=idx[t+(k+1)%3];nb[a].add(b);nb[b].add(a);}}
  return nb.map(s=>[...s]);
}

// piecewise-linear interpolation of keyframes [[py,val],...]
const lerpKF=(kf,py)=>{if(py<=kf[0][0])return kf[0][1];for(let i=1;i<kf.length;i++)if(py<=kf[i][0]){const [a,va]=kf[i-1],[b,vb]=kf[i];return va+(vb-va)*(py-a)/(b-a);}return kf[kf.length-1][1];};
const DL=[[330,0],[400,20],[500,34],[560,27],[650,22],[740,13],[800,16],[880,26],[1000,40],[1100,33],[1200,36],[1260,40],[1320,22],[1400,3],[1500,0]];
const DR=[[330,0],[400,12],[500,24],[560,15],[650,13],[740,3],[800,4],[880,6],[1000,0],[1100,0],[1200,2],[1260,9],[1320,5],[1400,0],[1500,0]];
export function warpBody(pos){
  const n=pos.length/3;
  // row extents of the mesh (min/max px per 10px row) for normalisation
  const L=new Float32Array(160).fill(1e9),R=new Float32Array(160).fill(-1e9);
  for(let i=0;i<n;i++){const py=toPy(pos[i*3+1]);if(py<330||py>1500)continue;const r=Math.floor(py/10);const px=toPx(pos[i*3]);if(px<L[r])L[r]=px;if(px>R[r])R[r]=px;}
  const XC=505;
  for(let i=0;i<n;i++){
    const py=toPy(pos[i*3+1]);if(py<330)continue;
    const px=toPx(pos[i*3]);const r=Math.min(159,Math.floor(py/10));
    let np=px;
    if(px<XC){const t=Math.min(1,Math.max(0,(XC-px)/Math.max(30,XC-L[r])));np=px+lerpKF(DL,py)*t;}
    else{const t=Math.min(1,Math.max(0,(px-XC)/Math.max(30,R[r]-XC)));np=px-lerpKF(DR,py)*t;}
    pos[i*3]=fromPx(np);
  }
}

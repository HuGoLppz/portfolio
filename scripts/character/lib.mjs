import fs from 'fs';
import {PNG} from 'pngjs';
import {fileURLToPath} from 'url';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url)).split('\\').join('/');
export function loadGLB(p=ROOT+'src/assets/white_mesh.glb'){
  const buf=fs.readFileSync(p);
  const jl=buf.readUInt32LE(12);
  const j=JSON.parse(buf.slice(20,20+jl).toString());
  const binStart=20+jl+8;
  const bin=buf.slice(binStart);
  const idx=new Uint32Array(bin.buffer.slice(bin.byteOffset,bin.byteOffset+480000));
  const pos=new Float32Array(bin.buffer.slice(bin.byteOffset+480000,bin.byteOffset+480000+238356));
  return {idx,pos};
}
export const readPNG=p=>PNG.sync.read(fs.readFileSync(p));
export const writePNG=(p,w,h,data)=>{const png=new PNG({width:w,height:h});png.data=Buffer.from(data);fs.writeFileSync(p,PNG.sync.write(png));};

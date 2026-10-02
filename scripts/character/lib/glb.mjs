// Lectura genérica de GLB (accessors → typed arrays) y escritura de GLB multi-malla
import fs from 'fs';

const COMP = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const NCOMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

export function readGLB(path) {
  const b = fs.readFileSync(path);
  const jl = b.readUInt32LE(12);
  const json = JSON.parse(b.toString('utf8', 20, 20 + jl));
  const binStart = 20 + jl + 8;
  const bin = b.subarray(binStart);
  const accessor = (i) => {
    const a = json.accessors[i], v = json.bufferViews[a.bufferView];
    const C = COMP[a.componentType], n = NCOMP[a.type];
    const off = bin.byteOffset + (v.byteOffset || 0) + (a.byteOffset || 0);
    const copy = new Uint8Array(a.count * n * C.BYTES_PER_ELEMENT);
    copy.set(new Uint8Array(bin.buffer, off, copy.length));
    return new C(copy.buffer);
  };
  return { json, accessor };
}

const ATTR_TYPE = { POSITION: 'VEC3', NORMAL: 'VEC3', TEXCOORD_0: 'VEC2', COLOR_0: 'VEC3', JOINTS_0: 'VEC4', WEIGHTS_0: 'VEC4' };

// Escritor de GLB: mallas con material propio, texturas embebidas y (opcional) piel con huesos
export class GLBWriter {
  constructor() {
    this.chunks = []; this.offset = 0;
    this.views = []; this.accessors = [];
    this.meshes = []; this.materials = []; this.textures = []; this.images = []; this.samplers = [];
    this.nodes = []; this.skins = [];
  }
  _push(buf) {
    const pad = (4 - (this.offset % 4)) % 4;
    if (pad) { this.chunks.push(Buffer.alloc(pad)); this.offset += pad; }
    const start = this.offset;
    this.chunks.push(buf); this.offset += buf.length;
    return start;
  }
  addView(buf, target) {
    const byteOffset = this._push(buf);
    this.views.push({ buffer: 0, byteOffset, byteLength: buf.length, ...(target ? { target } : {}) });
    return this.views.length - 1;
  }
  addAccessor(typed, type, { target, minmax = false } = {}) {
    const ctype = typed instanceof Float32Array ? 5126 : typed instanceof Uint32Array ? 5125 : typed instanceof Uint16Array ? 5123 : typed instanceof Uint8Array ? 5121 : null;
    const n = NCOMP[type];
    const view = this.addView(Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength), target);
    const acc = { bufferView: view, componentType: ctype, count: typed.length / n, type };
    if (minmax) {
      const mn = new Array(n).fill(Infinity), mx = new Array(n).fill(-Infinity);
      for (let i = 0; i < typed.length; i += n) for (let c = 0; c < n; c++) { mn[c] = Math.min(mn[c], typed[i + c]); mx[c] = Math.max(mx[c], typed[i + c]); }
      acc.min = mn; acc.max = mx;
    }
    this.accessors.push(acc);
    return this.accessors.length - 1;
  }
  addImage(buf, mimeType) {
    const view = this.addView(buf);
    this.images.push({ bufferView: view, mimeType });
    return this.images.length - 1;
  }
  addTexture(imageIndex, sampler = { magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }) {
    this.samplers.push(sampler);
    this.textures.push({ source: imageIndex, sampler: this.samplers.length - 1 });
    return this.textures.length - 1;
  }
  addMaterial(m) { this.materials.push(m); return this.materials.length - 1; }
  addMesh(name, { attributes, indices, material, extras }) {
    const attrs = {};
    for (const [k, v] of Object.entries(attributes)) {
      attrs[k] = this.addAccessor(v, ATTR_TYPE[k] || 'SCALAR', { target: 34962, minmax: k === 'POSITION' });
    }
    const idx = this.addAccessor(indices, 'SCALAR', { target: 34963 });
    this.meshes.push({ name, primitives: [{ attributes: attrs, indices: idx, material, mode: 4 }], ...(extras ? { extras } : {}) });
    return this.meshes.length - 1;
  }
  build(extraJson = {}) {
    const json = {
      asset: { version: '2.0', generator: 'portfolio character build' },
      ...extraJson,
      accessors: this.accessors, bufferViews: this.views, buffers: [{ byteLength: this.offset }],
      meshes: this.meshes, materials: this.materials,
      ...(this.textures.length ? { textures: this.textures, images: this.images, samplers: this.samplers } : {}),
      nodes: this.nodes, ...(this.skins.length ? { skins: this.skins } : {}),
    };
    let js = Buffer.from(JSON.stringify(json));
    js = Buffer.concat([js, Buffer.alloc((4 - (js.length % 4)) % 4, 0x20)]);
    const bin = Buffer.concat(this.chunks);
    const binP = Buffer.concat([bin, Buffer.alloc((4 - (bin.length % 4)) % 4)]);
    const hdr = Buffer.alloc(12); hdr.write('glTF', 0); hdr.writeUInt32LE(2, 4); hdr.writeUInt32LE(12 + 8 + js.length + 8 + binP.length, 8);
    const h1 = Buffer.alloc(8); h1.writeUInt32LE(js.length, 0); h1.write('JSON', 4);
    const h2 = Buffer.alloc(8); h2.writeUInt32LE(binP.length, 0); h2.write('BIN\0', 4);
    return Buffer.concat([hdr, h1, js, h2, binP]);
  }
}

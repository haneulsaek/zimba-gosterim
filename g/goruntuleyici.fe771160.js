/* ZIMBA 3B görüntüleyici: kod (set sayfasının verisinden sonra çalışır) */const METAL=[["sari","Sarı",[0.89,0.70,0.30],[1.0,0.76,0.32]],["beyaz","Beyaz",[0.85,0.84,0.81],[0.83,0.82,0.80]],["rose","Rose",[0.86,0.58,0.49],[0.98,0.62,0.50]]];
// Işık seçenekleri: gökyüzü / zemin rengi, koyu bayrak payı, ışık kutusu gücü, kutuların yumuşaklığı, kapanma dozu, temas gölgesi
const ISIKLAR={studyo:{gok:[0.4,0.37,0.32],yer:[0.06,0.052,0.045],bay:0.75,bay2:1.0,kut:2.1,poz:0.56,yum:0.0,ao:1.0,golge:0.3},
  aydinlik:{gok:[0.78,0.74,0.67],yer:[0.22,0.2,0.18],bay:0.12,kut:0.72,yum:0.22,ao:0.55,golge:0.2},
  sade:{gok:[0.58,0.58,0.59],yer:[0.19,0.18,0.17],bay:0.0,kut:0.5,yum:0.4,ao:0.0,golge:0.0}};
const TAS=[["garnet","Garnet",[0.58,0.07,0.13],0],["yakut","Yakut",[0.86,0.10,0.26],0],["turmalin","Pembe turmalin",[0.96,0.50,0.68],0],["ametist","Ametist",[0.60,0.36,0.86],0],
 ["safir","Safir",[0.12,0.24,0.76],0],["topaz","Mavi topaz",[0.33,0.70,0.96],0],["akuamarin","Akuamarin",[0.62,0.88,0.92],0],["zumrut","Zümrüt",[0.08,0.60,0.36],0],
 ["peridot","Peridot",[0.62,0.82,0.28],0],["limon","Limon kuvars",[1.0,0.95,0.58],0],["sitrin","Sitrin",[0.96,0.66,0.18],0],["dumanli","Dumanlı kuvars",[0.50,0.36,0.26],0],
 ["oniks","Oniks",[0.05,0.05,0.06],1],["renksiz","Renksiz (zirkon)",[0.95,0.96,0.98],2],["yok","Taşsız",null,0]];
const RENKSIZ=TAS[13];
// kayıttaki renk adları (sahne.json → taslar[].renk) → şablonun taş anahtarı; tanımsız ad beyaz/ilk taşa düşmesin
const RENK_ESA={koyu_kirmizi:"garnet",kirmizi:"yakut",pembe:"turmalin",mor:"ametist",mavi:"safir",acik_mavi:"topaz",yesil:"zumrut",sari:"sitrin",kahverengi:"dumanli",siyah:"oniks",beyaz:"renksiz",seffaf:"renksiz"};
const tasBul=k=>k?TAS.find(x=>x[0]===(RENK_ESA[k]||k)):null;
const TUR={dokum:"döküm",hazir:"hazır",tas:"hazır"};
const CANLI={sakin:[0.22,3.3,0.14],dogal:[0.35,2.3,0.22],canli:[0.5,1.6,0.32]};   // [gecikme, sönüm, kol]
const $=id=>document.getElementById(id), cv=$("c"), durum=$("durum"), app=$("app");
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)), ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const azHareket=matchMedia("(prefers-reduced-motion: reduce)").matches;
const sakla=(k,v)=>{ if(/(^#|&)gomulu(&|$)/.test(location.hash)) return; try{ localStorage.setItem(SET.kod+"-"+k,v); }catch(e){} }, oku=k=>{ try{ return localStorage.getItem(SET.kod+"-"+k); }catch(e){ return null; } };
let gl,U={},urun=null,ag={},metal=METAL[0],tas=TAS[0],kucuk=true,etiket=false,donIstek=false,oynuyor=false,p=1,mod="vitrin",kil=true,canli="dogal";
let metal2=null, ayrim=false, tasSecildi=false;
let yzKip=null, yzEl=[], dsKod=null, dsSk=null, dsAyri=false, dsB=[], dsBant=0, dsVurgu=-1e9;   // desen seçimi (yalnız yi[].dz olan üründe): dsKod bütün bantların deseni (null → varsayılan), dsSk sıklık, dsAyri/dsB bant başına desen   // yüzey işlemi görünümü: "dokum" | "isaret" (kesim bölgesi) | "sonra" (kesimden sonra); yalnız u.yi olan üründe
let fizikAcik=!azHareket, FZ=[], CIFT=[], esSap=0, esYun=0, DN=[], esSapD=0, esYunD=0;
let sapma=0,yunus=0,yakin=1,kay=[0,0],gizli=[],sira=[],etEl=[],hs=0,hy=0,sonDokunus=-1e9;
// küçük vektör yardımcıları (3x3 matrisler satır sıralı)
const KIM=[1,0,0,0,1,0,0,0,1];
const mv=(m,v)=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2], m[3]*v[0]+m[4]*v[1]+m[5]*v[2], m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
const mm=(a,b)=>{ const r=new Array(9); for(let i=0;i<3;i++) for(let j=0;j<3;j++) r[3*i+j]=a[3*i]*b[j]+a[3*i+1]*b[3+j]+a[3*i+2]*b[6+j]; return r; };
const top3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], cik=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], carp=(a,k)=>[a[0]*k,a[1]*k,a[2]*k], ic=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cap=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]], birim=a=>{ const l=Math.hypot(a[0],a[1],a[2])||1; return [a[0]/l,a[1]/l,a[2]/l]; };
// R sütun sıralı (WebGL'e giden hâli): dünya = R·model, model = Rᵀ·dünya
const rd=(R,v)=>[R[0]*v[0]+R[3]*v[1]+R[6]*v[2], R[1]*v[0]+R[4]*v[1]+R[7]*v[2], R[2]*v[0]+R[5]*v[1]+R[8]*v[2]];
const rt=(R,v)=>[R[0]*v[0]+R[1]*v[1]+R[2]*v[2], R[3]*v[0]+R[4]*v[1]+R[5]*v[2], R[6]*v[0]+R[7]*v[1]+R[8]*v[2]];
function yay(a,b){ const v=cap(a,b), c=ic(a,b); if(c<-0.999) return KIM; const k=1/(1+c);   // a yönünü b yönüne en kısa yoldan çeviren dönüş
  return [1-k*(v[1]*v[1]+v[2]*v[2]), -v[2]+k*v[0]*v[1], v[1]+k*v[0]*v[2],  v[2]+k*v[0]*v[1], 1-k*(v[0]*v[0]+v[2]*v[2]), -v[0]+k*v[1]*v[2],  -v[1]+k*v[0]*v[2], v[0]+k*v[1]*v[2], 1-k*(v[0]*v[0]+v[1]*v[1])]; }
function eksenDon(e,a){ const c=Math.cos(a), s=Math.sin(a), t=1-c, x=e[0], y=e[1], z=e[2];   // e ekseni çevresinde a kadar dönüş
  return [t*x*x+c,t*x*y-s*z,t*x*z+s*y, t*x*y+s*z,t*y*y+c,t*y*z-s*x, t*x*z-s*y,t*y*z+s*x,t*z*z+c]; }
async function coz(){ const ikili=Uint8Array.from(atob(B64),c=>c.charCodeAt(0));
  if(typeof DecompressionStream==="undefined") throw new Error("Bu tarayıcı sıkıştırılmış modeli açamıyor; güncel bir tarayıcıyla deneyin.");
  return new Uint8Array(await new Response(new Blob([ikili]).stream().pipeThrough(new DecompressionStream("deflate"))).arrayBuffer()); }
function agKur(veri,a){
  const dv=new Uint16Array(veri.buffer,veri.byteOffset+a.vo,a.nv*3), df=new Uint16Array(veri.buffer,veri.byteOffset+a.fo,a.nf*3);
  const P=new Float32Array(a.nv*3), I=new Uint16Array(a.nf*3); let x=0,y=0,z=0,k=0; const s=a.s/65535, lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9];
  for(let i=0;i<a.nv;i++){ x=(x+dv[3*i])&65535; y=(y+dv[3*i+1])&65535; z=(z+dv[3*i+2])&65535; const q=[a.lo[0]+x*s,a.lo[1]+y*s,a.lo[2]+z*s];
    for(let c=0;c<3;c++){ P[3*i+c]=q[c]; if(q[c]<lo[c]) lo[c]=q[c]; if(q[c]>hi[c]) hi[c]=q[c]; } }
  for(let i=0;i<I.length;i++){ k=(k+df[i])&65535; I[i]=k; }
  const mer=[(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2], yari=[(hi[0]-lo[0])/2,(hi[1]-lo[1])/2,(hi[2]-lo[2])/2];
  const t=(d,h)=>{ const b=gl.createBuffer(); gl.bindBuffer(h,b); gl.bufferData(h,d,gl.STATIC_DRAW); return b; };
  if(a.t){ // taş: her yüzey kendi düz normaliyle (fasetler keskin kalsın)
    const PP=new Float32Array(a.nf*9), NN=new Float32Array(a.nf*9), kume=new Map();
    for(let f=0;f<a.nf;f++){ const q=[I[3*f]*3,I[3*f+1]*3,I[3*f+2]*3];
      const u=[P[q[1]]-P[q[0]],P[q[1]+1]-P[q[0]+1],P[q[1]+2]-P[q[0]+2]], w=[P[q[2]]-P[q[0]],P[q[2]+1]-P[q[0]+1],P[q[2]+2]-P[q[0]+2]], n=cap(u,w), al=Math.hypot(n[0],n[1],n[2]), nb=birim(n);
      for(let j=0;j<3;j++) for(let c=0;c<3;c++){ PP[9*f+3*j+c]=P[q[j]+c]; NN[9*f+3*j+c]=nb[c]; }
      const an=nb.map(v=>Math.round(v*12)).join(), e=kume.get(an)||[0,0,0,0]; e[0]+=al; e[1]+=n[0]; e[2]+=n[1]; e[3]+=n[2]; kume.set(an,e); }
    let en=[0,0,0,1]; for(const e of kume.values()) if(e[0]>en[0]) en=e;          // en geniş düz yüzey = tabla
    const ek=birim([en[1],en[2],en[3]]); let uzak=[1,0,0], um=0;
    for(let i=0;i<a.nv;i++){ const r=cik([P[3*i],P[3*i+1],P[3*i+2]],mer), d=cik(r,carp(ek,ic(r,ek))), l=ic(d,d); if(l>um){ um=l; uzak=d; } }
    return {tas:true,vb:t(PP,gl.ARRAY_BUFFER),nb:t(NN,gl.ARRAY_BUFFER),ab:t(new Float32Array(a.nf*3).fill(1),gl.ARRAY_BUFFER),n:a.nf*3,ek,ek2:birim(uzak),mer,yari,boy:2*Math.max(yari[0],yari[1],yari[2])}; }
  if(a.no!==undefined){ // paketleyicinin gömdüğü kırışık açılı normaller (oktahedral 2×16) ve köşe başına ortam kapanması
    const nq=new Uint16Array(veri.buffer,veri.byteOffset+a.no,a.nv*2), aq=new Uint8Array(veri.buffer,veri.byteOffset+a.ao,a.nv), N=new Float32Array(a.nv*3), AO=new Float32Array(a.nv);
    for(let i=0;i<a.nv;i++){ let x=nq[2*i]/65535*2-1, y=nq[2*i+1]/65535*2-1; const z=1-Math.abs(x)-Math.abs(y);
      if(z<0){ const ox=x; x=(1-Math.abs(y))*(ox>=0?1:-1); y=(1-Math.abs(ox))*(y>=0?1:-1); } const l=Math.hypot(x,y,z)||1; N[3*i]=x/l; N[3*i+1]=y/l; N[3*i+2]=z/l; AO[i]=aq[i]/255; }
    const r_={tas:false,vb:t(P,gl.ARRAY_BUFFER),nb:t(N,gl.ARRAY_BUFFER),ab:t(AO,gl.ARRAY_BUFFER),ib:t(I,gl.ELEMENT_ARRAY_BUFFER),n:I.length,mer,yari,P,I};
    if(a.so!==undefined){ // desen çerçevesi (yüzey grubu): köşe başına (s, t, u); s, t, u'nun yüzey eğimleri üçgenlerden (alan ağırlıklı)
      const sq=new Uint16Array(veri.buffer,veri.byteOffset+a.so,a.nv*3), Q=new Float32Array(a.nv*3), G=new Float32Array(a.nv*9), W=new Float32Array(a.nv);
      for(let i=0;i<a.nv;i++) for(let c=0;c<3;c++) Q[3*i+c]=a.sl[c]+sq[3*i+c]/65535*a.sk[c];
      for(let f=0;f<I.length;f+=3){ const v=[I[f],I[f+1],I[f+2]], X=v.map(i=>[P[3*i],P[3*i+1],P[3*i+2]]), nn=cap(cik(X[1],X[0]),cik(X[2],X[0])), A2=Math.hypot(nn[0],nn[1],nn[2]); if(A2<1e-12) continue;
        const nu=carp(nn,1/A2), E=[cik(X[2],X[1]),cik(X[0],X[2]),cik(X[1],X[0])].map(e=>cap(nu,e));
        for(let c=0;c<3;c++){ let g=[0,0,0]; for(let j=0;j<3;j++) g=top3(g,carp(E[j],Q[3*v[j]+c])); g=carp(g,1/A2);
          for(const i of v) for(let k=0;k<3;k++) G[9*i+3*c+k]+=g[k]*A2; }
        for(const i of v) W[i]+=A2; }
      for(let i=0;i<a.nv;i++){ const w=W[i]||1; for(let k=0;k<9;k++) G[9*i+k]/=w; }
      r_.qb=t(Q,gl.ARRAY_BUFFER); r_.gb=t(G,gl.ARRAY_BUFFER); }
    return r_; }
  const N=new Float32Array(a.nv*3);
  for(let i=0;i<I.length;i+=3){ const a0=I[i]*3,b0=I[i+1]*3,c0=I[i+2]*3, ux=P[b0]-P[a0],uy=P[b0+1]-P[a0+1],uz=P[b0+2]-P[a0+2],vx=P[c0]-P[a0],vy=P[c0+1]-P[a0+1],vz=P[c0+2]-P[a0+2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx; for(const j of [a0,b0,c0]){ N[j]+=nx; N[j+1]+=ny; N[j+2]+=nz; } }
  return {tas:false,vb:t(P,gl.ARRAY_BUFFER),nb:t(N,gl.ARRAY_BUFFER),ab:t(new Float32Array(a.nv).fill(1),gl.ARRAY_BUFFER),ib:t(I,gl.ELEMENT_ARRAY_BUFFER),n:I.length,mer,yari};
}
// Stüdyo: yumuşak ışık kutuları (yön, yarı genişlik/yükseklik, renk). Madende ve taşta aynı ortam yansır.
const ISIK=[[[0,0.94,0.34],[1.0,0.5],[4.2,4.1,3.9]],[[0.62,0.42,0.66],[0.30,0.55],[3.6,3.4,3.1]],[[-0.9,0.12,0.42],[0.10,0.85],[2.6,2.7,2.9]],[[0,0.35,-0.94],[0.95,0.12],[2.0,2.0,2.0]],
 [[-0.35,-0.25,0.9],[0.5,0.18],[0.8,0.75,0.68]],[[0.05,0.2,1],[0.7,0.38],[1.45,1.36,1.22]],[[0.95,0.05,-0.3],[0.07,0.8],[2.2,2.1,2.0]],[[-0.55,0.75,-0.35],[0.22,0.12],[3.0,2.9,2.8]]];
// Koyu bayraklar: ışık kutularının arasında ortamı karartır; parlak metal karşıtlıkla okunur
const BAYRAK=[[[0.62,0.22,0.76],[0.11,0.55],0.8],[[-0.72,0.3,0.62],[0.11,0.5],0.75],[[0.0,0.64,0.77],[0.55,0.05],0.55]];
const v3=a=>"vec3("+a.map(x=>x.toFixed(4)).join(",")+")";
const ISIKGL=ISIK.map(([c,wh,r])=>{ c=birim(c); const tx=birim(cap([0,1,0],c)), ty=cap(c,tx); return "c+=kut*"+v3(r)+"*kutu(d,"+v3(c)+","+v3(tx)+","+v3(ty)+",vec2("+wh[0].toFixed(3)+","+wh[1].toFixed(3)+"),e+yum);"; }).join("\n ");
const BAYRAKGL=BAYRAK.map(([c,wh,k])=>{ c=birim(c); const tx=birim(cap([0,1,0],c)), ty=cap(c,tx); return "c*=1.0-bay*"+k.toFixed(3)+"*kutu(d,"+v3(c)+","+v3(tx)+","+v3(ty)+",vec2("+wh[0].toFixed(3)+","+wh[1].toFixed(3)+"),e*1.5+0.04);"; }).join("\n ");
// Yalnız Stüdyo'da (bay2) devreye giren geniş bayraklar: metalde belirgin açık–koyu geçiş; Aydınlık ve Sade etkilenmez
const BAYRAK2=[[[0.3,0.92,0.22],[0.075,0.95],0.85],[[-0.36,0.9,0.12],[0.06,0.95],0.8],[[0.0,0.62,-0.78],[0.7,0.09],0.7],
  [[0.75,0.55,0.35],[0.1,0.6],0.7],[[-0.8,0.45,0.3],[0.1,0.6],0.7],[[0.5,0.15,0.85],[0.2,0.6],0.6],[[-0.6,0.18,0.78],[0.18,0.55],0.55]];
// Mine parlamaları (yalnız mine programında): küçük, keskin pencereler (yön, yarı genişlik/yükseklik, güç). İlki önden bakışta madalyonun sol üstüne düşer.
const MINEP=[[[-0.035,-0.105,1],[0.014,0.005],2.0],[[0.045,-0.215,1],[0.0045,0.0045],1.4],[[0,0.94,0.34],[0.06,0.02],1.6],[[0.62,0.42,0.66],[0.02,0.045],1.6],[[-0.9,0.12,0.42],[0.012,0.07],1.2],[[0.05,0.2,1],[0.05,0.025],0.8]];
// Geniş, soluk parlaklık lekeleri (gauss): eğik bakışta üst ve yan ışık kutularının yumuşak yansıması (cam hissi); ön kutu yok (önden bakışta yüzeyi soldurmasın).
const MINEH=[[[0,0.94,0.34],[0.16,0.08],0.16],[[0.62,0.42,0.66],[0.07,0.13],0.14],[[-0.9,0.12,0.42],[0.05,0.16],0.12],[[-0.55,0.75,-0.35],[0.1,0.06],0.12],
  [[0.8,-0.45,0.4],[0.16,0.26],0.11],[[-0.85,-0.3,0.4],[0.16,0.26],0.11]];   // son ikisi: alçak yan yansıtıcı kartlar (yana eğik bakışta yumuşak parlaklık)
const MINEGL=MINEH.map(([c,wh,k])=>{ c=birim(c); const tx=birim(cap([0,1,0],c)), ty=cap(c,tx); return "g+=hale(d,"+v3(c)+","+v3(tx)+","+v3(ty)+",vec2("+wh[0].toFixed(4)+","+wh[1].toFixed(4)+"),"+k.toFixed(2)+");"; }).join("\n  ")+"\n  "+MINEP.map(([c,wh,k])=>{ c=birim(c); const tx=birim(cap([0,1,0],c)), ty=cap(c,tx); return "g+=parla(d,"+v3(c)+","+v3(tx)+","+v3(ty)+",vec2("+wh[0].toFixed(4)+","+wh[1].toFixed(4)+"),"+k.toFixed(2)+");"; }).join("\n  ");
const BAYRAK2GL=BAYRAK2.map(([c,wh,k])=>{ c=birim(c); const tx=birim(cap([0,1,0],c)), ty=cap(c,tx); return "c*=1.0-bay2*"+k.toFixed(3)+"*kutu(d,"+v3(c)+","+v3(tx)+","+v3(ty)+",vec2("+wh[0].toFixed(3)+","+wh[1].toFixed(3)+"),e*1.5+0.05);"; }).join("\n ");
/* İki program, aynı kaynak: desensiz (ana, prog_) ve "#define DESEN" ile desenli (PD, tembel: yalnız desen taşıyan parça "Kesimden sonra"da
   çizilirken ilk gerektiğinde derlenir). Desensiz program desen öncesi programla birebir aynıdır (ek öznitelik, aktarım, dal yok). */
const VS=`attribute float ao; attribute vec3 p; attribute vec3 n; uniform mat4 P; uniform mat3 R; uniform mat3 M; uniform vec3 T; uniform vec3 Tr; uniform vec4 kn; uniform vec3 zo; varying vec3 vN; varying vec3 vM; varying vec3 vV; varying float vAo;
#ifdef DESEN
attribute vec3 q; attribute vec3 gs; attribute vec3 gt; attribute vec3 gu; varying vec3 vQ; varying vec3 vGs; varying vec3 vGt; varying vec3 vGu;   // desen: (s, t, sınır uzaklığı) ve s, t, u'nun yüzey eğimleri (dünya)
#endif
void main(){ vAo=ao;
#ifdef DESEN
 vQ=q; vGs=R*(M*gs); vGt=R*(M*gt); vGu=R*(M*gu);
#endif
 vec3 m=M*p+Tr; vM=R*m; vec3 nn=kn.w>0.5?normalize(p-kn.xyz):n; vN=R*(M*nn); vV=vM+T; gl_Position=P*vec4(vV,1.0); gl_Position.xy+=zo.xy*gl_Position.w; gl_Position.z-=zo.z*gl_Position.w; }`;
const FS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vN; varying vec3 vM; varying vec3 vV; varying float vAo; uniform float yz; uniform float par; uniform vec3 C; uniform float tur; uniform float kil; uniform vec3 Sa; uniform vec3 Sb; uniform vec3 Sc; uniform float Ss; uniform float sac; uniform float sl; uniform float kes; uniform float ys; uniform float cz;
#ifdef DESEN
varying vec3 vQ; varying vec3 vGs; varying vec3 vGt; varying vec3 vGu; uniform float dv[13]; uniform float dE; uniform float dD;
/* DESEN (kesim deseni kütüphanesinin alan() işleviyle birebir): h(s,t) parçalı doğrusal derinlik, dönüş (h, ∂h/∂s, ∂h/∂t).
   dv[0] tip: 1 oluk aileleri (en çok 3, max; balık sırtında t<0 açı ters), 2 dalga, 3 ışın, 4 kum/buz kafesi, 5 yüzeycik, 6 çekiç. */
float hs(vec2 ij,float k){ vec2 p=ij+vec2(k*101.0,k*57.0); vec3 p3=fract(vec3(p.xyx)*0.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
vec2 cadir(float a,float p,float D,float ya){ float f=fract(a/p); return vec2(ya+(D-ya)*(1.0-abs(2.0*f-1.0)),(f<0.5?2.0:-2.0)*(D-ya)/p); }
bool ucg(vec2 x,vec3 A,vec3 B,vec3 C,inout vec3 r){ vec2 v0=B.xy-A.xy, v1=C.xy-A.xy, v2=x-A.xy; float d=v0.x*v1.y-v1.x*v0.y; if(abs(d)<1e-12) return false;
 float w1=(v2.x*v1.y-v1.x*v2.y)/d, w2=(v0.x*v2.y-v2.x*v0.y)/d; if(w1<-1e-6||w2<-1e-6||w1+w2>1.000001) return false;
 float e1=B.z-A.z, e2=C.z-A.z; r=vec3(A.z+w1*e1+w2*e2,(e1*v1.y-e2*v0.y)/d,(e2*v0.x-e1*v1.x)/d); return true; }
vec3 kumD(vec2 ij){ float p=dv[1], hy=p*0.8660254, oy=dv[4], t=dv[6];
 float q=hs(ij,t+2.0); if(dv[7]>0.5) q=q<0.5?q*0.3:0.4+q*0.6;
 return vec3((ij.x+0.5*ij.y)*p+oy*p*(hs(ij,t)-0.5), ij.y*hy+oy*hy*(hs(ij,t+1.0)-0.5), dv[3]+(dv[2]-dv[3])*(dv[5]+(1.0-dv[5])*q)); }
vec2 ycN(vec2 ij){ float L=dv[1], W=dv[2]; return vec2(ij.x*L*0.5+dv[5]*0.5*L*(hs(ij,dv[8])-0.5), ij.y*W*0.5+dv[5]*0.5*W*(hs(ij,dv[8]+1.0)-0.5)); }
vec3 ckT(vec2 ij){ float p=dv[1], hy=p*0.8660254, t=dv[7]; return vec3((ij.x+0.5*ij.y)*p+dv[4]*p*(hs(ij,t)-0.5), ij.y*hy+dv[4]*hy*(hs(ij,t+1.0)-0.5), dv[3]+(dv[2]-dv[3])*(dv[6]+(1.0-dv[6])*hs(ij,t+2.0))); }
vec3 ckK(vec2 ij,float tp){ float p=dv[1], hy=p*0.8660254, t=dv[7], k=dv[5]*p; vec2 c=tp<0.5?vec2((ij.x+0.5*ij.y)*p+p*0.5, ij.y*hy+hy/3.0):vec2((ij.x+0.5*ij.y)*p+p, ij.y*hy+2.0*hy/3.0);
 return vec3(c+k*(vec2(hs(ij,t+3.0+2.0*tp),hs(ij,t+4.0+2.0*tp))-0.5), dv[3]); }
vec3 desenH(vec2 x){ float tp=dv[0]; vec3 r=vec3(-1.0,0.0,0.0);
 if(tp<1.5){ for(int i=0;i<3;i++){ if(float(i)>=dv[4]) break; float an=i==0?dv[5]:(i==1?dv[6]:dv[7]); if(dv[8]>0.5&&x.y<0.0) an=-an;
   vec2 g=vec2(-sin(an),cos(an)); vec2 c=cadir(dot(g,x),dv[1],dv[2],dv[3]); if(c.x>r.x) r=vec3(c.x,c.y*g); } return r; }
 if(tp<2.5){ float L=dv[4], A=dv[5], f=fract(x.x/L), Z=A*(4.0*abs(f-0.5)-1.0), dZ=f<0.5?-4.0*A/L:4.0*A/L; vec2 c=cadir(x.y-Z,dv[1],dv[2],dv[3]); return vec3(c.x,-c.y*dZ,c.y); }
 if(tp<3.5){ vec2 X=x-vec2(dv[4],dv[5]); float d2=dv[6]*0.5, j=floor(atan(X.y,X.x)/d2), cift=mod(j,2.0)<0.5?1.0:0.0, jr=cift>0.5?j:j+1.0, jv=cift>0.5?j+1.0:j;
   vec2 er=vec2(cos(jr*d2),sin(jr*d2)), ev=vec2(cos(jv*d2),sin(jv*d2)); float det=er.x*ev.y-ev.x*er.y, m=dv[7];
   return vec3(dv[3]+m*(er.x*X.y-er.y*X.x)/det, -m*er.y/det, m*er.x/det); }
 if(tp<4.5){ float hy=dv[1]*0.8660254, v=x.y/hy, u=x.x/dv[1]-0.5*v; vec2 b=floor(vec2(u,v)); r=vec3(dv[3],0.0,0.0);
   for(int a=0;a<3;a++) for(int c=0;c<3;c++){ vec2 ij=b+vec2(a==0?0.0:(a==1?-1.0:1.0),c==0?0.0:(c==1?-1.0:1.0));
     vec3 A=kumD(ij), B=kumD(ij+vec2(1.0,0.0)), C=kumD(ij+vec2(0.0,1.0)), E=kumD(ij+vec2(1.0,1.0)); if(ucg(x,A,B,C,r)||ucg(x,B,E,C,r)) return r; } return r; }
 if(tp<5.5){ float L=dv[1], W=dv[2], D=dv[3], ya=dv[4], t=dv[8]; vec2 b=floor(vec2(x.x/(L*0.5),x.y/(W*0.5))+0.5); r=vec3(ya,0.0,0.0);
   for(int a=0;a<3;a++) for(int c=0;c<3;c++){ vec2 ij=b+vec2(a==0?0.0:(a==1?-1.0:1.0),c==0?0.0:(c==1?-1.0:1.0)); if(mod(ij.x+ij.y,2.0)>0.5) continue;
     vec3 M=vec3(ij.x*L*0.5+dv[6]*L*(hs(ij,t+2.0)-0.5), ij.y*W*0.5+dv[6]*W*(hs(ij,t+3.0)-0.5), min(ya+(D-ya)*(1.0-dv[7]+2.0*dv[7]*hs(ij,t+4.0)),D));
     vec3 K0=vec3(ycN(ij+vec2(-1.0,0.0)),ya), K1=vec3(ycN(ij+vec2(0.0,-1.0)),ya), K2=vec3(ycN(ij+vec2(1.0,0.0)),ya), K3=vec3(ycN(ij+vec2(0.0,1.0)),ya);
     if(ucg(x,K0,K1,M,r)||ucg(x,K1,K2,M,r)||ucg(x,K2,K3,M,r)||ucg(x,K3,K0,M,r)) return r; } return r; }
 { float hy=dv[1]*0.8660254, v=x.y/hy, u=x.x/dv[1]-0.5*v; vec2 b=floor(vec2(u,v)+0.5); r=vec3(dv[3],0.0,0.0);
   for(int a=0;a<3;a++) for(int c=0;c<3;c++){ vec2 ij=b+vec2(a==0?0.0:(a==1?-1.0:1.0),c==0?0.0:(c==1?-1.0:1.0)); vec3 M=ckT(ij);
     vec3 K0=ckK(ij,0.0), K1=ckK(ij+vec2(-1.0,0.0),1.0), K2=ckK(ij+vec2(-1.0,0.0),0.0), K3=ckK(ij+vec2(-1.0,-1.0),1.0), K4=ckK(ij+vec2(0.0,-1.0),0.0), K5=ckK(ij+vec2(0.0,-1.0),1.0);
     if(ucg(x,M,K0,K1,r)||ucg(x,M,K1,K2,r)||ucg(x,M,K2,K3,r)||ucg(x,M,K3,K4,r)||ucg(x,M,K4,K5,r)||ucg(x,M,K5,K0,r)) return r; } return r; } }
#endif
float kutu(vec3 d,vec3 c,vec3 tx,vec3 ty,vec2 wh,float e){ float z=dot(d,c); if(z<=0.02) return 0.0; vec2 uv=abs(vec2(dot(d,tx),dot(d,ty))/z); vec2 m=1.0-smoothstep(wh-e,wh+e,uv); return m.x*m.y; }
uniform vec3 gok; uniform vec3 yer; uniform float bay; uniform float bay2; uniform float poz; uniform float kut; uniform float yum; uniform float aoD; uniform float gez;
vec3 ortam(vec3 d,float e){
 float cg=cos(gez), sg=sin(gez); d=vec3(cg*d.x-sg*d.z,d.y,sg*d.x+cg*d.z);   // ışık gezinmesi: ortam düşey eksende çok az kayar
 vec3 c=mix(yer,gok,smoothstep(-0.25,0.95,d.y));
 c+=vec3(0.13,0.09,0.05)*(1.0-smoothstep(-0.95,-0.15,d.y));
 c*=1.0-0.62*bay*(1.0-smoothstep(0.0,0.10+e,abs(d.y+0.07)));
 ${BAYRAKGL}
 ${ISIKGL}
 ${BAYRAK2GL}
 return c; }
#ifdef MINE
float parla(vec3 d,vec3 c,vec3 tx,vec3 ty,vec2 wh,float k){ float z=dot(d,c); if(z<=0.02) return 0.0; vec2 q=vec2(dot(d,tx),dot(d,ty))/(z*wh); float r2=dot(q,q);
 return k*(exp(-r2*r2*1.5)+0.07*exp(-r2*0.25)); }   /* mine parlaması: yuvarlatılmış, keskin çekirdek + soluk hale */
float hale(vec3 d,vec3 c,vec3 tx,vec3 ty,vec2 wh,float k){ float z=dot(d,c); if(z<=0.02) return 0.0; vec2 q=vec2(dot(d,tx),dot(d,ty))/(z*wh); return k*exp(-dot(q,q)); }
#endif
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }
vec3 ton(vec3 x){ float m=max(max(x.r,x.g),max(x.b,0.0001)); vec3 a=x*(aces(vec3(m)).r/m); return pow(mix(a,aces(x),0.28),vec3(0.4545)); }   // parlak yerde de metalin rengi kalsın
void main(){ if(cz>0.5){ gl_FragColor=vec4(ton(vec3(0.70,0.11,0.037)*1.7)*sl,sl); return; }
 vec3 n=normalize(vN); vec3 v=normalize(-vV);
#ifdef MINE
 { if(dot(n,v)<0.0) n=-n; float nv=max(dot(n,v),0.0); vec3 r=reflect(-v,n); float f=pow(1.0-nv,5.0); float oc=1.0-aoD*(1.0-smoothstep(0.08,0.62,vAo));
  /* soğuk mine (epoksi), çıktı palet renginde (ton eğrisinden geçmez): önden bakışta renk = palet rengi. Gövde ışığı ortamın normal yönündeki
     parlaklığının bakış yönündekine oranı (eğildikçe hafif açılır/koyulaşır; ışık kipinden bağımsız). */
  vec3 W=vec3(0.3,0.55,0.15); float s=clamp(dot(ortam(n,0.9),W)/max(dot(ortam(v,0.9),W),1e-3),0.72,1.08)*0.97*mix(1.0,oc,0.5);
  /* yansıma: ortam BULANIK örneklenir (ışık kutularının kenarı yüzeyde keskin çizgi çizmesin), Fresnel ile önden zayıf, sıyırmada güçlü, üst sınırlı */
  float F=min(0.007+0.55*f,0.4); vec3 eb=ortam(r,0.5); eb=eb/(1.0+0.4*dot(eb,W));
  /* küçük keskin parlamalar: dünyaya bağlı birkaç küçük pencere (döndürünce yüzeyde gezer); önden bakışta biri sol üstte */
  float cg=cos(gez), sg=sin(gez); vec3 d=vec3(cg*r.x-sg*r.z,r.y,sg*r.x+cg*r.z); float g=0.0;
  ${MINEGL}
  vec3 col=C*s*(1.0-F)+eb*F+vec3(1.0,0.985,0.96)*g*(0.55+0.45*f);
  col=mix(col,0.8+0.2*(1.0-exp(-(col-0.8)*5.0)),step(0.8,col));   /* parlamada yumuşak doyma */
  if(ys>0.5) col=mix(col,vec3(1.0),0.2);   /* bölge seçilince kısa süre açık */
  gl_FragColor=vec4(pow(clamp(col,0.0,1.0),vec3(0.4545))*sl,sl); return; }
#endif
#ifdef DESEN
 { vec3 H=desenH(vQ.xy); vec3 g=H.y*vGs+H.z*vGt; if(dD*vQ.z/dE<H.x) g=(dD/dE)*vGu; n=normalize(n+g); }   // desen: n' = n + ∇h (h içeri derinlik); kenarda etek h ≤ D·u/etek
#endif
 if(dot(n,v)<0.0) n=-n; float nv=max(dot(n,v),0.0); vec3 r=reflect(-v,n); float f=pow(1.0-nv,5.0); vec3 col;
 if(kil>0.5){ vec3 L=normalize(vec3(0.42,0.62,0.66)); vec3 b=tur<0.5?vec3(0.66,0.64,0.60):vec3(0.46,0.58,0.70);
  col=b*(0.16+0.40*(0.5+0.5*n.y)+0.62*max(dot(n,L),0.0)+0.10*max(dot(n,vec3(-0.8,0.1,0.5)),0.0))+0.10*pow(max(dot(r,L),0.0),20.0); gl_FragColor=vec4(pow(min(col,1.0),vec3(0.85)),1.0); return; }
 if(tur<0.5){ vec3 F=C+(1.0-C)*f; float kendi=1.0-smoothstep(-0.35,0.2,r.y); vec3 env;
  if(yz<0.5) env=mix(ortam(r,0.025),ortam(r,0.45),0.22);
  else if(yz<1.5){ vec3 tg=normalize(cross(n,vec3(0.0,1.0,0.0))+vec3(1e-4)); env=(ortam(normalize(r+tg*0.25),0.16)+ortam(r,0.2)+ortam(normalize(r-tg*0.25),0.16))*0.333*0.92; }   // saten: yönlü fırça
  else if(yz<2.5) env=ortam(r,0.6)*0.85;
#ifdef DESEN
  else if(yz<3.5) env=ortam(r,0.008)*1.12;
  else { env=ortam(r,0.0); env=env*env/(env+vec3(0.28))*1.5; }   /* desen (yz 4): ayna kesim; karşıtlık artırılır (faset ya parlar ya kararır), renk metalden */
#else
  else env=ortam(r,0.008)*1.12;   /* elmas kesim gösterimi (yz 3): düz fasetler, keskin yansıma; her faset ya ışık kutusunu ya bayrağı görür */
#endif
  float oc=1.0-aoD*(1.0-smoothstep(0.08,0.62,vAo));   // kapanma yalnız gerçek girintide (yuva, ajur dibi, katman arası); yansımada zayıf
  col=F*(env*1.3*poz*mix(1.0,oc,0.55)+C*kendi*0.22*oc);
  if(yz>2.5){ float kv=pow(max(dot(r,normalize(vec3(0.0,0.94,0.34))),0.0),420.0)+pow(max(dot(r,normalize(vec3(0.62,0.42,0.66))),0.0),420.0)+pow(max(dot(r,normalize(vec3(-0.9,0.12,0.42))),0.0),320.0)+pow(max(dot(r,normalize(vec3(-0.55,0.75,-0.35))),0.0),320.0); col+=F*kv*7.0;
#ifdef DESEN
   if(yz>3.5){ float kp=0.0; kp+=pow(max(dot(r,normalize(vec3(0.0,0.94,0.34))),0.0),2400.0); kp+=pow(max(dot(r,normalize(vec3(0.62,0.42,0.66))),0.0),2400.0);
    kp+=pow(max(dot(r,normalize(vec3(-0.9,0.12,0.42))),0.0),1800.0); kp+=pow(max(dot(r,normalize(vec3(-0.55,0.75,-0.35))),0.0),1800.0);
    kp+=pow(max(dot(r,normalize(vec3(0.3,0.6,0.75))),0.0),3000.0); kp+=pow(max(dot(r,normalize(vec3(-0.3,0.85,0.45))),0.0),3000.0);
    col+=mix(F,vec3(1.0),0.25)*kp*14.0; }   // desen: dar kıvılcımlar; döndürünce yüzeycikler sırayla yanıp söner
#endif
  }
  if(ys>0.5){ float l=dot(col,vec3(0.3,0.55,0.15)); col=mix(col,vec3(0.70,0.11,0.037)*(0.3+1.25*l),0.6); } }   // yalnız belirgin girinti koyulaşır (geniş düz yüzeyde iz kalmasın)   // aşağı bakan yansımada metal kendini görür
 else { vec3 yans=ortam(r,0.03)*(0.045+0.955*f);
  if(tur>4.5){ vec3 ic=ortam(refract(-v,n,0.66),0.22);   // taş boncuk: fasetsiz cilalı küre, yarı saydam
   col=C*(ic*0.85+0.03)+C*ortam(n,0.6)*0.12*poz+yans*1.25; }
  else if(tur>3.5){ float oc=1.0-aoD*(1.0-smoothstep(0.08,0.62,vAo)); vec3 ir=0.5+0.5*cos(6.2831*(vec3(0.0,0.33,0.67)+nv*1.4+0.15));   // inci: yumuşak sedef, hafif gökkuşağı
   col=C*(ortam(n,0.8)*0.6*oc*poz+0.05)+C*pow(nv,3.0)*0.1+ortam(r,0.2)*(0.06+0.45*f)*mix(vec3(1.0),ir,0.45)*poz; }
  else if(tur>2.5){ float oc=1.0-aoD*(1.0-smoothstep(0.08,0.62,vAo)); vec3 ic=ortam(refract(-v,n,0.67),0.35);   // mine: opak, parlak; yüzeyin altında hafif derinlik
   col=C*(ortam(n,0.85)*0.55*oc*poz+0.04)+C*ic*0.18+yans*1.15; }
  else if(tur>1.5){ col=C*0.25+yans*1.4; }
  else if(kes>0.5){ // yuvarlak dışı kesim (oval, damla, baget, markiz): içteki yansıma taşın kendi fasetlerinden; her faset ayrı yöne bakar
   vec3 a=normalize(Sa); vec3 r1=refract(-v,n,0.42); vec3 tg=n-a*dot(n,a); float tl=length(tg); tg=tl>1e-4?tg/tl:vec3(0.0);
   vec3 r2=reflect(r1,normalize(-a*0.75+tg*0.66)); vec3 r3=reflect(r2,normalize(-a*0.75-tg*0.66)); vec3 d0=normalize(r3+tg*0.9+n*0.2);   // iki köşk yansıması: faset eğimine göre
   vec3 ic=vec3(ortam(normalize(d0-tg*sac),0.05).r, ortam(d0,0.05).g, ortam(normalize(d0+tg*sac),0.05).b);
   ic=pow(min(ic,vec3(2.4))/2.4,vec3(1.7))*2.4; ic=mix(vec3(dot(ic,vec3(0.3,0.5,0.2))),ic,0.4);   // koyu-açık karşıtlığı; renk saçılması ölçülü
   col=C*(0.1+1.6*ic)+yans*0.95;
   float kv=pow(max(dot(r3,normalize(vec3(0.0,0.94,0.34))),0.0),140.0)+pow(max(dot(r,normalize(vec3(0.62,0.42,0.66))),0.0),220.0)+pow(max(dot(r2,normalize(vec3(-0.9,0.12,0.42))),0.0),160.0);
   col+=vec3(kv)*mix(vec3(5.0),C*5.0+1.5,0.35); }
  else { vec3 a=normalize(Sa); vec3 t1=normalize(Sb-a*dot(Sb,a)); vec3 t2=cross(a,t1);
   vec3 r1=refract(-v,n,0.58); vec3 h=(vM-Sc)+r1*Ss*0.42; vec3 u=h-a*dot(h,a);
   float aci=atan(dot(u,t2),dot(u,t1)); float halka=step(0.2,length(u)/Ss); float dil=0.7854*mix(1.0,0.5,halka);
   float aq=(floor(aci/dil+0.5)+0.25*halka)*dil; vec3 uq=cos(aq)*t1+sin(aq)*t2; float eg=mix(0.62,0.86,halka);
   vec3 r2=reflect(r1,normalize(-uq*eg+a*0.66)); vec3 r3=reflect(r2,normalize(uq*eg+a*0.66));
   vec3 yan=r3-a*dot(r3,a); vec3 d0=normalize(r3+yan*1.6+n*0.35);
   vec3 ic=vec3(ortam(normalize(d0-uq*sac),0.06).r, ortam(d0,0.06).g, ortam(normalize(d0+uq*sac),0.06).b);
   col=C*(0.14+1.5*min(ic,vec3(2.2)))+yans*0.9;
   float kv=pow(max(dot(r3,normalize(vec3(0.0,0.94,0.34))),0.0),180.0)+pow(max(dot(r,normalize(vec3(0.62,0.42,0.66))),0.0),260.0)+pow(max(dot(r2,normalize(vec3(-0.9,0.12,0.42))),0.0),220.0);
   col+=vec3(kv)*mix(vec3(5.0),C*5.0+1.5,0.35); } }   // küçük taşta da faset parlaması ve kıvılcım
 if(tur>0.5) col*=1.0+par*1.6;   // montaj: taş yuvasına otururken kısa parıltı
 gl_FragColor=vec4(ton(col)*sl,sl); }`;
function progYap(on){ const p=gl.createProgram(); gl.attachShader(p,kabuk(gl.VERTEX_SHADER,on+VS)); gl.attachShader(p,kabuk(gl.FRAGMENT_SHADER,on+FS));
  gl.bindAttribLocation(p,0,"p"); gl.bindAttribLocation(p,1,"n"); gl.bindAttribLocation(p,2,"ao"); if(on) ["q","gs","gt","gu"].forEach((k,i)=>gl.bindAttribLocation(p,3+i,k)); gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
/* desenli program (tembel): ilk desenli çizimde derlenir. Ana programın o anki bütün uniform değerleri her geçişte ona aktarılır (yalnız
   "Kesimden sonra"da desen taşıyan parça için; desensiz sayfada hiç çalışmaz). */
/* mine programı (tembel, desenli program gibi): yalnız mineli üründe "Mineli" görünümde mine yüzeyi (rl 3) çizilirken ilk gerektiğinde derlenir.
   Ana programın uniform değerleri her mine parçasından önce aktarılır; minesiz sayfada hiç çalışmaz (ana program değişmedi). */
let PM=null;
function mineProg(){ if(PM) return PM; const p=progYap("#define MINE 1\n"), L=[], n=gl.getProgramParameter(prog_,gl.ACTIVE_UNIFORMS);
  for(let i=0;i<n;i++){ const a=gl.getActiveUniform(prog_,i), ad=a.name.replace(/\[0\]$/,""), k=gl.getUniformLocation(p,ad); if(k) L.push([gl.getUniformLocation(prog_,ad),k,a.type]); }
  PM={p,L,C:gl.getUniformLocation(p,"C"),ys:gl.getUniformLocation(p,"ys")}; return PM; }
function mineGec(){ const D=mineProg(), V=D.L.map(([a,,ty])=>[gl.getUniform(prog_,a),ty]); gl.useProgram(D.p);
  D.L.forEach(([,k],i)=>{ const [v,ty]=V[i]; if(ty===gl.FLOAT) gl.uniform1f(k,v); else if(ty===gl.FLOAT_VEC3) gl.uniform3fv(k,v); else if(ty===gl.FLOAT_VEC4) gl.uniform4fv(k,v);
    else if(ty===gl.FLOAT_MAT3) gl.uniformMatrix3fv(k,false,v); else if(ty===gl.FLOAT_MAT4) gl.uniformMatrix4fv(k,false,v); else if(ty===gl.FLOAT_VEC2) gl.uniform2fv(k,v); else gl.uniform1i(k,v); });
  return D; }
let PD=null;
function desenProg(){ if(PD) return PD; const p=progYap("#define DESEN 1\n"), L=[], n=gl.getProgramParameter(prog_,gl.ACTIVE_UNIFORMS);
  for(let i=0;i<n;i++){ const a=gl.getActiveUniform(prog_,i), ad=a.name.replace(/\[0\]$/,""), k=gl.getUniformLocation(p,ad); if(k) L.push([gl.getUniformLocation(prog_,ad),k,a.type]); }
  PD={p,L,dv:gl.getUniformLocation(p,"dv[0]"),dE:gl.getUniformLocation(p,"dE"),dD:gl.getUniformLocation(p,"dD"),yz:gl.getUniformLocation(p,"yz"),ys:gl.getUniformLocation(p,"ys")}; return PD; }
function desenGec(){ const D=desenProg(), V=D.L.map(([a,,ty])=>[gl.getUniform(prog_,a),ty]); gl.useProgram(D.p);
  D.L.forEach(([,k],i)=>{ const [v,ty]=V[i]; if(ty===gl.FLOAT) gl.uniform1f(k,v); else if(ty===gl.FLOAT_VEC3) gl.uniform3fv(k,v); else if(ty===gl.FLOAT_VEC4) gl.uniform4fv(k,v);
    else if(ty===gl.FLOAT_MAT3) gl.uniformMatrix3fv(k,false,v); else if(ty===gl.FLOAT_MAT4) gl.uniformMatrix4fv(k,false,v); else if(ty===gl.FLOAT_VEC2) gl.uniform2fv(k,v); else gl.uniform1i(k,v); });
  return D; }
function kabuk(t,s){ const k=gl.createShader(t); gl.shaderSource(k,s); gl.compileShader(k); if(!gl.getShaderParameter(k,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(k)); return k; }
/* Montaj: ayrılma yönleri veriden. Gövde (en büyük döküm grubu) yerinde kalır; öteki parçalar ürünün ağırlık merkezinden kendi merkezlerine
   doğru açılır (küçük gruplar daha uzağa); pim/mil kendi uzun ekseni boyunca çekilir; sarkan parçalar zincir sırasına göre kademeli iner;
   taşlar yuvalarının bulunduğu parçayla gider ve tabla yönünde kalkar. Küme dosyasında "patlat": {"<parça deseni>": {"yon":[x,y,z],"mesafe":0.3,"sira":n}}
   ile üstüne yazılır. Sıra (birleşirken): gövde, öteki döküm parçalar (büyükten küçüğe), hazır parçalar, en son taşlar. */
function patlatKur(){ const P_=urun.parcalar, G=urun.gruplar, A_=ag[urun.kod], olc=urun.olc, OZ=urun.patlat||{};
  urun._mo=1; if(urun.montaj){ const M_=urun.montaj;   // sözleşme: takılma yönü "yon", patlatmada tersine "mesafe"
    const ara_=clamp(olc*0.04,1.5,2);   // zincirde önceki adımların katkısı: komşular arası ~1,5–2 mm (dizi kadrajı taşırmasın)
    const NM=urun.mek||[], dug=i=>new Set(P_.filter(q=>q.ms===i&&q.mk>=0).map(q=>q.mk)), ata=(a,b)=>{ for(let k=b;k>=0;k=NM[k].u) if(k===a) return true; return false; };
    const bagli=(i,j)=>{ const A=dug(i), B=dug(j); for(const a of A) for(const b of B) if(ata(a,b)||ata(b,a)) return true; return false; };   // aynı zincirde (biri ötekinin üstü/altı)
    const cum=M_.map((st,i)=>{ if(!st.d||st.m==null) return 0; let c=st.m; for(let j=0;j<i;j++) if(M_[j].d&&M_[j].m!=null&&ic(M_[j].d,st.d)>0.95&&bagli(i,j)) c+=Math.min(M_[j].m,ara_); return c; });   // zincirde art arda takılanlar birikerek dizilir; yan yana bağımsız parçalar (dişliler) kendi mesafesinde
    P_.forEach(q=>{ q._om=null; if(!(q.ms>=0)) return; const st=M_[q.ms]; let v=st.d&&st.m!=null?carp(st.d,-cum[q.ms]):[0,0,0];
      if(q.my||q.mm!=null){ const d2=q.my||st.d, m2=q.mm!=null?q.mm:st.m; if(d2&&m2!=null){ const A=q.A||KIM, a_=A_[Array.isArray(q.m)?q.m[0]:q.m], yb=[0,1,2].map(k=>Math.abs(A[3*k])*a_.yari[0]+Math.abs(A[3*k+1])*a_.yari[1]+Math.abs(A[3*k+2])*a_.yari[2]), boy=2*(Math.abs(d2[0])*yb[0]+Math.abs(d2[1])*yb[1]+Math.abs(d2[2])*yb[2]);
        v=top3(v,carp(d2,-(q.my?Math.min(m2,boy*1.15+0.4):m2))); } }   // kendi ekseni (pim): tam çıkacak kadar, hemen yanında   // parçanın kendi yönü (pim): adımıyla gelir, sonra kendi ekseninde takılır
      if(st.m!=null||q.mm!=null) q._om=v; });
    const eks=[]; M_.forEach(st=>{ if(!st.d||st.m==null) return; const w=st.m*Math.max(1,P_.filter(q=>q.ms===M_.indexOf(st)).length), e=eks.find(x=>Math.abs(ic(x.d,st.d))>0.95); if(e) e.w+=w; else eks.push({d:st.d,w}); });
    urun._eks=eks.length?eks.sort((a,b)=>b.w-a.w)[0].d:null;   // baskın takılma ekseni (kamera 3/4 için)
    let mx=0; P_.forEach(q=>{ if(q._om) mx=Math.max(mx,Math.hypot(q._om[0],q._om[1],q._om[2])); }); if(mx>1.1*olc) urun._mo=1.1*olc/mx; }   // aşırı mesafe kadraja göre orantılanır
  const ozel=q=>{ for(const d in OZ) if(new RegExp(d).test(q.id||"")) return OZ[d]; return null; };
  P_.forEach(q=>{ const a=A_[Array.isArray(q.m)?q.m[0]:q.m], A=q.A||KIM; q._y=[0,1,2].map(k=>Math.abs(A[3*k])*a.yari[0]+Math.abs(A[3*k+1])*a.yari[1]+Math.abs(A[3*k+2])*a.yari[2]);
    q._v=Math.max(1e-3,q._y[0]*q._y[1]*q._y[2]); q._t=G[q.g].tur==="tas"; q._o=[0,0,0]; });
  const met=P_.filter(q=>!q._t&&!q.rl); let W=0, C=[0,0,0];   // yüzey grubu / demo (rl) döküm parçası sayılmaz met.forEach(q=>{ W+=q._v; C=top3(C,carp(q.c,q._v)); }); C=carp(C,1/(W||1));
  const gv=G.map(()=>0); met.forEach(q=>{ gv[q.g]+=q._v; });
  let govde=-1; G.forEach((g,i)=>{ if(g.tur==="dokum"&&(govde<0||gv[i]>gv[govde])) govde=i; }); if(govde<0) G.forEach((g,i)=>{ if(g.tur!=="tas"&&(govde<0||gv[i]>gv[govde])) govde=i; });
  const derece=G.map((g,i)=>i).filter(i=>i!==govde&&G[i].tur!=="tas").sort((a,b)=>gv[b]-gv[a]), rank=G.map(()=>0); derece.forEach((g,k)=>{ rank[g]=k; });
  const S=urun.sarkac, derin=i=>{ let d=1; while(S[i].par>=0){ i=S[i].par; d++; } return d; };
  met.forEach(q=>{ const oz=ozel(q);
    if(urun.montaj&&q.ms>=0){ const M_=urun.montaj, st=M_[q.ms], d=q.my||st.d, m_=q.mm!=null?q.mm:st.m; if(!d){ q._o=[0,0,0]; return; }   // montaj adımı
      if(q._om){ q._o=carp(q._om,urun._mo); return; }
      let k=0; for(let j=0;j<q.ms;j++) if(M_[j].d&&ic(M_[j].d,d)>0.95) k++; q._o=carp(d,olc*(0.42+0.07*k)); return; }   // eski kayıt (mesafesiz): yönünden dizilerek gelir
    if(oz&&oz.yon){ q._o=carp(birim(oz.yon),olc*(oz.mesafe!=null?oz.mesafe:0.35)); return; }
    if(q.mk>=0&&urun.mek[q.mk].t==="d"){ const n=urun.mek[q.mk]; let dp=1,k=n.u; while(k>=0){ dp++; k=urun.mek[k].u; } q._o=carp(n.e,(ic(cik(q.c,C),n.e)>=0?1:-1)*olc*0.11*dp); return; }   // mil boyunca
    if(q.pd>=0){ q._o=carp(rd(KIM,S[q.pd].d0),olc*0.13*derin(q.pd)); return; }
    if(q.g===govde) return;
    if(/^(pim|mentese|mil|percin)/.test(q.id||"")){ const ax=q._y.indexOf(Math.max(...q._y)), v=[0,0,0]; v[ax]=(q.c[ax]-C[ax])>=0?1:-1; q._o=carp(v,olc*0.32); return; }
    let d=cik(q.c,C), L=Math.hypot(d[0],d[1],d[2]); if(L<olc*0.03){ d=birim([0,0.45,1]); L=1; }   // merkezdeki katman: öne ve hafif yukarı (önden bakışta da ayrılsın)
    q._o=carp(d,olc*Math.min(0.34,0.2+0.04*Math.min(rank[q.g],4))/L); });   // geniş ürünlerde (kolye) bağlantılar kadrajdan taşmasın
  P_.filter(q=>q._t).forEach(q=>{ const mst=urun.montaj&&q.ms>=0?urun.montaj[q.ms]:null, md=mst?(q.my||mst.d):null, mm_=mst?(q.mm!=null?q.mm:mst.m):null;
    if(mst&&q.tp){ q._ev=null; q._k=q._om?carp(q._om,urun._mo):md?carp(md,olc*0.42):[0,0,0]; q._o=q._k; return; }   // serbest top kendi adımının yönünden gelir
    let ev=null, en=1e9; met.forEach(m=>{ const dd=Math.hypot(...cik(m.c,q.c)); if(dd<en){ en=dd; ev=m; } });
    const a=A_[Array.isArray(q.m)?q.m[0]:q.m]; let n=a.ek?birim(mv(q.A||KIM,a.ek)):[0,1,0]; if(ic(n,cik(q.c,C))<0) n=carp(n,-1);   // tabla yönü ürünün dışına
    const oz=ozel(q); q._ev=oz&&oz.yon?null:ev; q._k=oz&&oz.yon?carp(birim(oz.yon),olc*(oz.mesafe!=null?oz.mesafe:0.2)):carp(n,olc*0.14); if(md&&mm_!=null) q._k=carp(md,-mm_*urun._mo); q._o=top3(q._ev?q._ev._o:[0,0,0],q._k); });
  P_.forEach(q=>{ if(q.rl&&q.dp>=0){ const B=P_[q.dp]; q._ev=B; q._k=[0,0,0]; q._o=B._o; } });   // yüzey grubu / demo gövdeyle birlikte ayrılır
  let R=0; P_.forEach(q=>{ const c=top3(q.c,q._o); R=Math.max(R,Math.hypot(...c)+Math.max(...q._y)); }); urun._boyA=Math.max(urun.olc,2*R*1.04);
  urun._mA=null; urun._mK=null; if(urun._eks){ const lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9];   // yön/mesafe kayıtlı montaj: kadraj birleşik + ayrık hâlin kutusuna (merkezi kayar, dizi kadrajı doldurur)
    P_.forEach(q=>{ for(const o of [[0,0,0],q._o||[0,0,0]]) for(let k=0;k<3;k++){ const c=q.c[k]+o[k]; lo[k]=Math.min(lo[k],c-q._y[k]); hi[k]=Math.max(hi[k],c+q._y[k]); } });
    urun._mA=[0,1,2].map(k=>(lo[k]+hi[k])/2); urun._mK=[lo,hi]; urun._boyA=mKadraj(1); }
  const anah=i=>{ const oz=P_.filter(q=>q.g===i).map(ozel).find(x=>x&&x.sira!=null); if(oz) return oz.sira; return i===govde?-1:G[i].tur==="dokum"?0:G[i].tur==="hazir"?1:2; };
  return G.map((g,i)=>i).sort((a,b)=>anah(a)-anah(b)||gv[b]-gv[a]||a-b); }
function mKadraj(en){ const [lo,hi]=urun._mK, R=Rkur(sapma,yunus,urun.taban), m=urun._mA; let hw=0, hh=0;   // ayrık kutuyu o anki bakışta ekrana sığdıran boy (her karede; kutu kadrajı sıkı doldurur)
  for(let i=0;i<8;i++){ const v=rd(R,cik([i&1?hi[0]:lo[0],i&2?hi[1]:lo[1],i&4?hi[2]:lo[2]],m)); hw=Math.max(hw,Math.abs(v[0])); hh=Math.max(hh,Math.abs(v[1])); }
  const t=Math.tan(13*Math.PI/180)*2.5; return 1.25*(en<1?Math.max(hh*en,hw):Math.max(hh,hw/en))/t; }
function etken(g){ const i=sira.indexOf(g), n=sira.length; return 1-ease(clamp(p*n-i,0,1)); }   // 1: tam ayrık, 0: yerinde
/* Sallanma. Her sarkan parça asıldığı noktadan sabit boylu bir sarkaç (konum tabanlı çözüm).
   - Model dönünce asma noktası yer değiştirir; parça kısmen geride kalır, sonra söner.
   - Halkada kendi ekseni çevresinde hafif burulur (dönüşe geç uyar, yay gibi geri gelir).
   - Komşu sallantılar birbirinin içinden geçmez: yaklaşınca itilirler.
   - Açı sınırı: halkanın izin verdiği kadar; düz takılarda düzlem dışına az çıkar. */
const BURK=44, BURS=2.6, BURMAX=0.38, GUC={hafif:850,dogal:1500,guclu:2500}; let yerCekimi=true, guc="dogal";
function fizik(dt,R){ const S=urun.sarkac; if(!S.length) return;
  const dSap=sapma-esSap, dYun=yunus-esYun; esSap=sapma; esYun=yunus;
  if(!fizikAcik||p<0.999){ S.forEach((s,i)=>{ const st=FZ[i]; st.x=null; st.Q=KIM; st.pp=s.piv; st.d=s.d0; st.f=0; st.fv=0; st.dv=null; }); return; }
  const [GECIKME,SONUM,KOL]=CANLI[canli], CEKIM=GUC[guc], PAY=yerCekimi?1:0;   // PAY 1: ağırlık ekranın aşağısına; 0: parça ürüne göre asılı durur
  const adim=Math.max(1,Math.min(5,Math.round(dt/0.006))), h=dt/adim, kos=Math.cos(urun.koni*Math.PI/180), sn=Math.exp(-SONUM*h), ex=rt(R,[1,0,0]), ey=rt(R,[0,Math.cos(yunus),Math.sin(yunus)]);
  for(let k=0;k<adim;k++){ S.forEach((s,i)=>{ const st=FZ[i], ata=s.par>=0?FZ[s.par]:null;
    const pm=ata?top3(mv(ata.Q,cik(s.piv,S[s.par].piv)),ata.pp):s.piv, pw=rd(R,[pm[0],pm[1],pm[2]-KOL*urun.olc]); st.pp=pm;   // dönme ekseni parçanın biraz gerisinde: boyunda ya da elde tutuluyormuş gibi
    if(!st.x){ const b0=rd(R,s.d0); st.x=top3(pw,carp(birim([b0[0]*(1-PAY),b0[1]*(1-PAY)-PAY,b0[2]*(1-PAY)]),s.L)); st.xp=st.x.slice(); st.pw=pw; st.d=rt(R,birim(cik(st.x,pw))); }
    if(k===0){ const es=cik(st.x,pw), tas_=carp(rd(R,st.d),s.L), yn=birim([es[0]*GECIKME+tas_[0]*(1-GECIKME),es[1]*GECIKME+tas_[1]*(1-GECIKME),es[2]*GECIKME+tas_[2]*(1-GECIKME)]);   // parça kısmen eski yerinde kalır
      const yx=top3(pw,carp(yn,s.L)), fark=cik(yx,st.x); st.x=yx; st.xp=top3(st.xp,fark);
      st.f=clamp(st.f-0.6*(dSap*ic(ey,st.d)+dYun*ic(ex,st.d)),-BURMAX,BURMAX); }
    if(st.dv){ st.xp=cik(st.x,carp(st.dv,h)); st.dv=null; }
    st.pw=pw; const g0=rd(R,s.d0), g=[g0[0]*(1-PAY),g0[1]*(1-PAY)-PAY,g0[2]*(1-PAY)], x=st.x, xp=st.xp, ivme=CEKIM*h*h;
    let nx=[x[0]+(x[0]-xp[0])*sn+g[0]*ivme, x[1]+(x[1]-xp[1])*sn+g[1]*ivme, x[2]+(x[2]-xp[2])*sn+g[2]*ivme];
    let d=rt(R,birim(cik(nx,pw))), sinir=false;
    if(urun.duzlem){ const dz=clamp(d[2]-s.d0[2],-0.62,0.62)+s.d0[2]; if(dz!==d[2]){ sinir=true; const l=Math.hypot(d[0],d[1])||1, o=Math.sqrt(Math.max(0,1-dz*dz))/l; d=[d[0]*o,d[1]*o,dz]; } }
    const c=ic(d,s.d0); if(c<kos){ sinir=true; const dik=birim(cik(d,carp(s.d0,c))), sk=Math.sqrt(1-kos*kos); d=[s.d0[0]*kos+dik[0]*sk,s.d0[1]*kos+dik[1]*sk,s.d0[2]*kos+dik[2]*sk]; }
    nx=top3(pw,carp(rd(R,d),s.L)); st.xp=sinir?[(x[0]+nx[0])/2,(x[1]+nx[1])/2,(x[2]+nx[2])/2]:x; st.x=nx; st.d=d;
    st.fv+=(-BURK*st.f-BURS*st.fv)*h; st.f=clamp(st.f+st.fv*h,-BURMAX,BURMAX);
    st.Q=mm(yay(s.d0,d),eksenDon(s.d0,st.f)); });
   for(const [i,j,en] of CIFT){ const a=FZ[i], b=FZ[j], ca=top3(a.pp,carp(a.d,a.Lc)), cb=top3(b.pp,carp(b.d,b.Lc)), ar=cik(cb,ca), uz=Math.hypot(ar[0],ar[1],ar[2]);   // komşular çarpışmasın
    if(uz>=en||uz<1e-6) continue; const it=carp(ar,(en-uz)/(2*uz));
    for(const [st,s,c,yon] of [[a,S[i],ca,-1],[b,S[j],cb,1]]){ const d=birim(cik(top3(c,carp(it,yon)),st.pp)), nx=top3(st.pw,carp(rd(R,d),s.L)), fk=cik(nx,st.x);
      st.xp=top3(st.xp,carp(fk,0.75)); st.x=nx; st.d=d; st.Q=mm(yay(s.d0,d),eksenDon(s.d0,st.f)); } } }
}
// Kendi ekseninde dönen parça (mile geçmiş dümen gibi): ürün çevrilince olduğu yerde kalmak ister, mildeki sürtünme onu yavaşça ürüne uydurur.
function donerAdim(dt,R){ const dS=sapma-esSapD, dY=yunus-esYunD; esSapD=sapma; esYunD=yunus; if(!DN.length) return;
  if(p<0.999){ DN.forEach(st=>{ st.w=0; }); return; }
  const ex=rt(R,[1,0,0]), ey=rt(R,[0,Math.cos(yunus),Math.sin(yunus)]), k=1-Math.exp(-1.1*dt);
  urun.doner.forEach((d,i)=>{ const st=DN[i]; if(d.sin){ st.f+=(st.h-st.f)*(1-Math.exp(-4*dt)); return; }   // menteşe: hedefe yumuşakça gider
    const wm=fizikAcik?clamp((dS*ic(ey,d.eks)+dY*ic(ex,d.eks))/dt,-12,12):0; st.w+=(wm-st.w)*k; st.f+=(st.w-wm)*dt; if(wm===0&&Math.abs(st.w)<2e-3) st.w=0; }); }
function salla(){ if(!urun||!fizikAcik) return; const R=sonR; urun.sarkac.forEach((s,i)=>{ const st=FZ[i]; if(!st.x) return; const hiz=0.34*Math.sqrt(GUC[guc]*s.L)*(0.85+0.3*Math.random());
  st.dv=[hiz,0,hiz*(Math.random()-.5)*0.6]; st.fv+=(Math.random()-.5)*4; }); }
let sonR=KIM, odakK=1, sonBoy=1;
function Rkur(s,y,taban){ const cy=Math.cos(s),sy=Math.sin(s),cx=Math.cos(y),sx=Math.sin(y), R=[cy,sx*sy,-cx*sy, 0,cx,sx, sy,-sx*cy,cx*cy];   // önce düşey eksende sapma, sonra öne yatma
  return taban==="-z"?[R[0],R[1],R[2], R[6],R[7],R[8], -R[3],-R[4],-R[5]]:R; }   // "-z": modelin yukarısı −Z (kelepçe gibi yatık kurulanlar); dik getirilir
/* Görüntü kalitesi: ürün durunca her karede alt piksel kaydırılmış bir örnek çizilir ve ortalanır (16 örnek: fotoğraf gibi temiz kenar);
   hareket başlayınca birikim sıfırlanır. Hareket sırasında kare süresi uzunsa çözünürlük düşer, durunca tam çözünürlüğe döner. */
let QP=null, QB=null, QU={}, BK={n:0,imza:"",S:null,A:null,w:0,h:0}, cozOlcek=1, ortDt=0.016; const BK_MAX=16;
function dortgenKur(ana){ const vs=`attribute vec2 q; uniform vec4 Q; varying vec2 vq; void main(){ vq=q; gl_Position=vec4(Q.xy+q*Q.zw,0.0,1.0); }`;
  const fs=`precision mediump float; varying vec2 vq; uniform sampler2D t; uniform float kip; uniform float a;
    void main(){ if(kip<0.5){ gl_FragColor=texture2D(t,vq*0.5+0.5); } else { float r=dot(vq,vq); float al=a*exp(-2.4*r)*(1.0-smoothstep(0.55,1.0,r)); gl_FragColor=vec4(0.0,0.0,0.0,al); } }`;
  QP=gl.createProgram(); gl.attachShader(QP,kabuk(gl.VERTEX_SHADER,vs)); gl.attachShader(QP,kabuk(gl.FRAGMENT_SHADER,fs)); gl.bindAttribLocation(QP,0,"q"); gl.linkProgram(QP);
  for(const k of ["Q","t","kip","a"]) QU[k]=gl.getUniformLocation(QP,k);
  QB=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,QB); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW); QP.ana=ana; }
function dortgen(Q,kip,tex,a){ gl.useProgram(QP); gl.disableVertexAttribArray(1); gl.disableVertexAttribArray(2); gl.bindBuffer(gl.ARRAY_BUFFER,QB); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  gl.uniform4f(QU.Q,Q[0],Q[1],Q[2],Q[3]); gl.uniform1f(QU.kip,kip); gl.uniform1f(QU.a,a||0); if(tex){ gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,tex); gl.uniform1i(QU.t,0); }
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4); gl.useProgram(QP.ana); gl.enableVertexAttribArray(1); gl.enableVertexAttribArray(2); }
function hedefKur(w,h){ const yap=()=>{ const tx=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tx); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D,k,v);
    const fb=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,fb); gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tx,0); return {tx,fb}; };
  for(const k of ["S","A"]) if(BK[k]){ gl.deleteTexture(BK[k].tx); gl.deleteFramebuffer(BK[k].fb); if(BK[k].db) gl.deleteRenderbuffer(BK[k].db); }
  BK.S=yap(); const db=gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER,db); gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h); gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,db); BK.S.db=db;
  const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE; BK.A=yap(); gl.bindFramebuffer(gl.FRAMEBUFFER,null); BK.w=w; BK.h=h; return ok; }
const HAL=(i,b)=>{ let f=1,r=0; while(i>0){ f/=b; r+=f*(i%b); i=Math.floor(i/b); } return r; };
function imzaAl(){ const z=x=>typeof x==="number"?x.toFixed(4):String(x); let s=[sapma,yunus,yakin,kay[0],kay[1],p,odakK,mod,kil,metal[0],metal2?metal2[0]:"",tas[0],isik,gezinme,kucuk,etiket,gizli.join(),urun.kod,cv.clientWidth,cv.clientHeight].map(z).join("|");
  for(const st of FZ) if(st.x) s+="|"+st.x.map(x=>x.toFixed(2)).join(",")+st.f.toFixed(3); for(const st of DN) s+="|"+st.f.toFixed(3); if(urun.rg) s+="|"+RS.map(x=>x[0]).join(); if(urun.top) s+="|t"+TOP[0]+(topSecildi?"!":""); if(mekGorAcik()) s+="|mg"; for(const st of MKS) if(st.kl) s+="|k"+st.kl.toFixed(3); if(urun.montaj) s+="|g"+gizliA.join()+aktifA; for(const st of MKS) s+="|"+st.a.toFixed(4)+(st.r?st.r.map(x=>x.toFixed(3)).join(","):""); if(urun.yi) s+="|y"+yzKip+(dsKod||"")+(dsSk||"")+(dsAyri?"A"+dsB.join(",")+dsBant:"")+(performance.now()-dsVurgu<900?"v":""); if(urun.mn) s+="|m"+mnKip+mnR.map(x=>x[0]).join()+(mnAyri?"A"+mnBolge+(performance.now()-mnVurgu<900?"v":""):""); return s; }
/* Işık gezinmesi: ürün durunca ortam ±7° yatay, 14 sn dönemle yumuşak sinüs çizer; yansımalar canlı durur. Açıkken durağan birikim bitmez:
   kaydırılmış örnekler üstel ortalamayla (son ≈5 kare) karışır, kare hızı 30'a sınırlanır. Kapalıyken 16 örnek biriktirilip çizim durur. */
let isik="studyo", gezinme=!azHareket, gezT0=performance.now(), gorunur=true, sonCizim=0;
const gezAci=()=>gezinme?0.122*Math.sin((performance.now()-gezT0)/14000*2*Math.PI):0;
function ciz(dt){
  if(!urun) return; const im=imzaAl(), durgun=im===BK.imza&&!basili.size, an=performance.now(), gercek=Math.min(1,(an-(BK.t||an))/1000); BK.imza=im; BK.t=an;
  if(!durgun){ ortDt=ortDt*0.85+gercek*0.15; if(ortDt>0.05&&cozOlcek>0.5){ cozOlcek=Math.max(0.5,cozOlcek*0.8); ortDt=0.03; } }
  const o=Math.min(window.devicePixelRatio||1,2)*(durgun?1:cozOlcek), w=Math.round(cv.clientWidth*o), h=Math.round(cv.clientHeight*o); if(w<2||h<2) return;
  if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; BK.n=0; }
  if(!durgun){ BK.n=0; gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,w,h); sahneCiz(dt,w,h,0,0); return; }
  if(BK.w!==w||BK.h!==h){ if(!hedefKur(w,h)){ gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,w,h); sahneCiz(dt,w,h,0,0); return; } BK.n=0; }
  const gez_=gezinme&&mod!=="teknik";
  if(gez_&&BK.n>=4&&performance.now()-sonCizim<33) return;   // gezinirken 30 kare/sn yeter
  if(BK.n<BK_MAX||gez_){ const k=BK.n, i_=(k%16)+1, jx=k?HAL(i_,2)-0.5:0, jy=k?HAL(i_,3)-0.5:0; sonCizim=performance.now();
    gl.bindFramebuffer(gl.FRAMEBUFFER,BK.S.fb); gl.viewport(0,0,w,h); sahneCiz(dt,w,h,jx,jy);
    gl.bindFramebuffer(gl.FRAMEBUFFER,BK.A.fb); gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendColor(0,0,0,gez_?Math.max(1/(k+1),0.2):1/(k+1)); gl.blendFunc(gl.CONSTANT_ALPHA,gl.ONE_MINUS_CONSTANT_ALPHA);
    dortgen([0,0,1,1],0,BK.S.tx); gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); BK.n++; }
  else { fizik(dt,sonR); donerAdim(dt,sonR); mekAdim(dt,sonR); }
  gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,w,h); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); gl.disable(gl.DEPTH_TEST); dortgen([0,0,1,1],0,BK.A.tx); gl.enable(gl.DEPTH_TEST); }
function sahneCiz(dt,w,h,jx,jy){
  // odak: ürünün asıl parçası (kolye ucu, madalyonlar…) çerçevelenir ve dönüş onun merkezinde olur; Montaj modunda bütün ürün (eski davranış)
  const hedefK=urun.odak&&mod!=="montaj"?1:0; odakK+=(hedefK-odakK)*(1-Math.exp(-6*dt));
  if(urun._mK) urun._boyA=mKadraj(w/h);
  const Od=urun.odak, bt=urun.olc+((urun._boyA||urun.olc*1.5)-urun.olc)*ease(1-p), boy=Od?bt+(Od.b-bt)*odakK:bt, fc=urun._mA?top3(Od?carp(Od.m,odakK):[0,0,0],carp(urun._mA,ease(1-p))):(Od?carp(Od.m,odakK):[0,0,0]); sonBoy=boy;
  const en=w/h, f=1/Math.tan(13*Math.PI/180), D=boy*(en<1?2.5/en:2.5)/yakin, yk=urun.olc*0.05, uz=D+urun.olc*4;
  const P=new Float32Array([f/en,0,0,0, 0,f,0,0, 2*jx/w,2*jy/h,(uz+yk)/(yk-uz),-1, 0,0,2*uz*yk/(yk-uz),0]);
  const R=Rkur(sapma,yunus,urun.taban); sonR=R; const Rf=rd(R,fc);
  { const L=ISIKLAR[isik]; gl.uniform3f(U.gok,...L.gok); gl.uniform3f(U.yer,...L.yer); gl.uniform1f(U.bay,L.bay); gl.uniform1f(U.bay2,L.bay2||0); gl.uniform1f(U.poz,L.poz||1); gl.uniform1f(U.kut,L.kut); gl.uniform1f(U.yum,L.yum); gl.uniform1f(U.aoD,L.ao); gl.uniform1f(U.gez,gezAci()); }
  fizik(dt,R); donerAdim(dt,R); mekAdim(dt,R); MKT=mekDonusum(); KAM={R,T:[kay[0]-Rf[0],kay[1]-Rf[1],-D-Rf[2]],f,en};
  gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  if(p>0.999&&odakK<0.5&&ISIKLAR[isik].golge>0){ // temas gölgesi: ürünün ekrandaki alt kenarında yumuşak elips
    const b=urun.boyut.map(x=>x/2), T=[kay[0]-Rf[0],kay[1]-Rf[1],-D-Rf[2]]; let x0=9,x1=-9,y0=9;
    for(let i=0;i<8;i++){ const q=top3(rd(R,[i&1?b[0]:-b[0],i&2?b[1]:-b[1],i&4?b[2]:-b[2]]),T), sx=f/en*q[0]/-q[2], sy=f*q[1]/-q[2]; x0=Math.min(x0,sx); x1=Math.max(x1,sx); y0=Math.min(y0,sy); }
    const rx=(x1-x0)*0.42; if(rx>0&&y0>-0.92){ gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
      dortgen([(x0+x1)/2,y0-rx*0.04*en,rx*1.1,rx*0.13*en],1,null,ISIKLAR[isik].golge); gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); } }
  gl.uniformMatrix4fv(U.P,false,P); gl.uniformMatrix3fv(U.R,false,new Float32Array(R)); gl.uniform3f(U.T,kay[0]-Rf[0],kay[1]-Rf[1],-D-Rf[2]); gl.uniform1f(U.kil,mod==="teknik"&&kil?1:0);
  const G=urun.gruplar, top=G.map(()=>[0,0,0,0]), S=urun.sarkac, A_=ag[urun.kod];
  const soluk=mekGorAcik(), solL=[]; gl.uniform1f(U.sl,1);
  const yzk=yzGor(), mnA=mnGor();
  const cizQ=(pc,gec)=>{ if(pc.rl===3?!mnA:(pc.rl&&(pc.rl===2?yzk!=="sonra":(yzk==="sonra"&&!pc._dz)))) return;   /* mine yüzeyi (rl 3) yalnız "Mineli"de */   /* demo yalnız "Kesimden sonra"da; yüzey grubu orada gizli (desen katmanında desenle çizilir) */
    if(soluk&&!gec&&!mekVurgu(pc)){ solL.push(pc); return; } const g=G[pc.g], tasMi=g.tur==="tas", e=etkenQ(pc); let O=pc._ev?top3(carp(pc._ev._o,etkenQ(pc._ev)),carp(pc._k,e)):carp(pc._o||[0,0,0],e);   // taş yuvasının bulunduğu parçayla gider, sonra yuvaya oturur
    if(!pc.rl){ const t=top[pc.g]; t[0]+=pc.c[0]+O[0]; t[1]+=pc.c[1]+O[1]; t[2]+=pc.c[2]+O[2]; t[3]++; }
    const topQ=!!(urun.top&&pc.tp);   // serbest top (inci, taş boncuk, altın): taş grubunda olsa da "Top" seçimiyle çizilir
    if(gizli[pc.g]||(tasMi&&!topQ&&!tas[2])) return;
    if(urun.montaj&&gizliA[adimNo(pc)]) return;   // montaj listesinde gizlenen adım
    if(pc.kn>=0&&MKS[pc.kn]&&MKS[pc.kn].kl>0){ const n_=urun.mek[pc.kn]; O=top3(O,carp(n_.kl.d,-n_.kl.m*MKS[pc.kn].kl)); }   // kilit parçası çekilmiş
    const A=pc.A||KIM, b=pc.b||[0,0,0]; let M=A, Tr=top3(b,O);
    const mk_=pc.mk>=0?pc.mk:(tasMi&&pc._ev&&pc._ev.mk>=0?pc._ev.mk:-1);   // taş, yuvasının bulunduğu parçanın düğümüyle gider
    if(mk_>=0&&MKT){ const T_=MKT[mk_]; M=mm(T_.M,A); Tr=top3(top3(mv(T_.M,b),T_.t),O); }
    if(pc.dn>=0){ const dd=urun.doner[pc.dn], Qd=eksenDon(dd.eks,DN[pc.dn].f); M=mm(Qd,A); Tr=top3(top3(mv(Qd,cik(b,dd.mer)),dd.mer),O); }
    if(pc.pd>=0){ const st=FZ[pc.pd], b0=(pc.dn>=0||mk_>=0)?cik(Tr,O):b; M=mm(st.Q,M); Tr=top3(top3(mv(st.Q,cik(b0,S[pc.pd].piv)),st.pp),O); }   // dönen parça sarkaca asılıysa ikisi birleşir
    pc._M=M; pc._T=Tr;
    gl.uniformMatrix3fv(U.M,false,new Float32Array([M[0],M[3],M[6],M[1],M[4],M[7],M[2],M[5],M[8]])); gl.uniform3f(U.Tr,Tr[0],Tr[1],Tr[2]);
    const ms=Array.isArray(pc.m)?pc.m:[pc.m], a=A_[ms[0]]; gl.uniform1f(U.yz,pc.rl===2?3:(pc.yz||0)); gl.uniform1f(U.ys,pc.rl===1&&yzk==="isaret"?1:0); gl.uniform1f(U.par,tasMi&&e>0&&e<0.35&&p<0.999?Math.sin(Math.PI*e/0.35):0);
    gl.uniform4f(U.kn,0,0,0,0);
    const dzA=pc.rl===1&&yzk==="sonra"&&pc._dz&&!gec;   // desen taşıyan yüzey grubu: desenli programla çizilir (aşağıda)
    if(topQ){ const t_=(!topSecildi&&pc.tv&&topBul(pc.tv))||TOP, r=t_[4]===0?METAL[0][3]:t_[3], a_=A_[Array.isArray(pc.m)?pc.m[0]:pc.m]; gl.uniform3f(U.C,r[0],r[1],r[2]); gl.uniform1f(U.tur,t_[4]); gl.uniform4f(U.kn,a_.mer[0],a_.mer[1],a_.mer[2],1); }   // küre normali: fasetsiz
    else if(tasMi){ const t_=(ayrim&&kucuk&&pc.k)?RENKSIZ:tas, r=t_[2], us=t_[3]===2?1.2:2.1;
      gl.uniform3f(U.C,Math.pow(r[0],us),Math.pow(r[1],us),Math.pow(r[2],us)); gl.uniform1f(U.tur,t_[3]===1?2:1); gl.uniform1f(U.sac,t_[3]===2?0.16:0.05); gl.uniform1f(U.kes,pc.kz||0);
      const sa=rd(R,mv(M,a.ek)), sb=rd(R,mv(M,a.ek2)), sc=rd(R,top3(mv(M,a.mer),Tr));
      gl.uniform3f(U.Sa,sa[0],sa[1],sa[2]); gl.uniform3f(U.Sb,sb[0],sb[1],sb[2]); gl.uniform3f(U.Sc,sc[0],sc[1],sc[2]); gl.uniform1f(U.Ss,a.boy); }
    else if(urun.rg&&pc.rk>=0){ const m_=RS[pc.rk], r=m_[3]; gl.uniform3f(U.C,r[0],r[1],r[2]); gl.uniform1f(U.tur,urun.rg[pc.rk].m?3:0); }   // renk grubu / mine
    else { const r=(pc.dn>=0&&metal2?metal2:metal)[3]; gl.uniform3f(U.C,r[0],r[1],r[2]); gl.uniform1f(U.tur,0); }
    if((urun.montaj&&mod==="montaj"&&aktifA>=0&&adimNo(pc)===aktifA)||(soluk&&!gec)){ const c_=gl.getUniform(prog_,U.C); gl.uniform3f(U.C,c_[0]*1.35+0.05,c_[1]*1.35+0.04,c_[2]*1.35+0.02); }   // açık satırın parçaları vurgulu
    if(dzA){ const D=desenGec(), z=pc._dz, g=z.y.dz.d[dsBantKod(z.b)][dsSik()].g[z.b]; gl.uniform1f(D.yz,4); gl.uniform1fv(D.dv,new Float32Array(g)); gl.uniform1f(D.dE,z.y.dz.e||0.11); gl.uniform1f(D.dD,g[0]===5?g[3]:g[2]);
      if(dsAyri&&z.b===dsBant&&performance.now()-dsVurgu<900) gl.uniform1f(D.ys,1); }   // bant seçilince kısa süre işaretli
    const mnQ=pc.rl===3&&!gec;   // mine yüzeyi: mine programıyla, gövdenin önüne hafif kaydırılmış derinlikle (yuva kenarıyla çakışmasın)
    if(mnQ){ const D=mineGec(), r=(mnR[pc.mb]||MINE_R[0])[3]; gl.uniform3f(D.C,r[0],r[1],r[2]); gl.uniform1f(D.ys,mnAyri&&pc.mb===mnBolge&&performance.now()-mnVurgu<900?1:0);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-1,-2); }
    for(const mi of ms){ const a=A_[mi], dq=dzA&&a.qb;
    gl.bindBuffer(gl.ARRAY_BUFFER,a.vb); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,a.nb); gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,a.ab); gl.vertexAttribPointer(2,1,gl.FLOAT,false,0,0);
    if(dq){ for(let k=3;k<7;k++) gl.enableVertexAttribArray(k); gl.bindBuffer(gl.ARRAY_BUFFER,a.qb); gl.vertexAttribPointer(3,3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,a.gb); for(let k=0;k<3;k++) gl.vertexAttribPointer(4+k,3,gl.FLOAT,false,36,12*k); }
    if(a.tas) gl.drawArrays(gl.TRIANGLES,0,a.n); else { gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,a.ib); gl.drawElements(gl.TRIANGLES,a.n,gl.UNSIGNED_SHORT,0); }
    if(dq) for(let k=3;k<7;k++) gl.disableVertexAttribArray(k); }
    if(dzA) gl.useProgram(prog_);
    if(mnQ){ gl.disable(gl.POLYGON_OFFSET_FILL); gl.useProgram(prog_); } };
  urun.parcalar.forEach(pc=>cizQ(pc,false));
  if(solL.length){ gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.uniform1f(U.sl,0.2); solL.forEach(pc=>cizQ(pc,true)); gl.uniform1f(U.sl,1); gl.depthMask(true); gl.disable(gl.BLEND); }   // gövde soluk: pimler, miller arkadan görünür
  gl.uniform1f(U.ys,0); if(yzEl.length) yzCiz(w,h,R,yzk);
  // etiketler: grubun ağırlık merkezini ekrana düşür (montajda parçalıyken, teknikte her zaman)
  const etAcik=etiket&&mod==="montaj"&&p<0.985;
  G.forEach((g,i)=>{ const el=etEl[i], t=top[i]; if(!el) return;
    const gor=etAcik&&!gizli[i]&&t[3]>0&&!(g.tur==="tas"&&!tas[2]); el.hidden=!gor; if(!gor) return;
    const q=rd(R,[t[0]/t[3],t[1]/t[3],t[2]/t[3]]), qx=q[0]+kay[0]-Rf[0], qy=q[1]+kay[1]-Rf[1], qz=q[2]-D-Rf[2];
    const sx2=(f/en*qx/-qz*.5+.5)*cv.clientWidth, sy2=(1-(f*qy/-qz*.5+.5))*cv.clientHeight;
    el.style.transform="translate("+(sx2+8).toFixed(1)+"px,"+(sy2-11).toFixed(1)+"px)"; });
}
/* ── HAREKET AĞACI (mekanizmalar): düğümler "u" ile ağaç; her düğüm üstünün hareketli çerçevesinde döner (d: dönme, m: mafsal) ya da
   serbest gezer (s: kaptaki inci). Model: düğümün eksen çevresindeki mutlak açısal hızı (wa) korunur, yatak sürtünmesi onu üst çerçeveye uydurur
   (ürün çevrilince halka geride kalır); ağırlık merkezi eksenden kaçıksa yerçekimi torku; mafsalda dinlenmeye yay + açı sınırı; "o" (oran) bağlı
   dönme: açı = kaynak × çarpan + faz (dişliler, gecikmesiz). Sarkaç fiziği (bütün ürünün sallanması) ağacın kökünde aynen sürer. */
/* ── RENK GRUPLARI (u.rg, parça rk): grup başına metal ya da mine rengi; "Hepsi" bütün metal grupları aynı yapar; seçim adrese yazılır (#urun=…&renk=cerceve:sari,…).
   ── MONTAJ ANLATIMI (u.montaj, parça ms): Montaj kipinde adım adım; adımın parçaları "yon" boyunca dışarıdan gelip oturur, sonraki adımlar gizli. Yoksa eski Parçala/Birleştir. */
const MINE=[["lacivert","Lacivert",null,[0.035,0.07,0.3]],["turkuaz","Turkuaz",null,[0.03,0.45,0.5]],["zumrut","Zümrüt",null,[0.02,0.33,0.15]],["bordo","Bordo",null,[0.36,0.02,0.06]],
  ["siyah","Siyah",null,[0.018,0.018,0.022]],["fildisi","Fildişi",null,[0.8,0.74,0.6]],["mercan","Mercan",null,[0.85,0.3,0.2]],["mor","Mor",null,[0.26,0.06,0.38]]];
MINE.forEach(m=>{ m[2]=m[3].map(x=>Math.pow(x,1/2.2)); });
let RS=[], TOP=null, gizliA=[], aktifA=-1, prog_=null, topSecildi=false;
const renkListe=g=>g.m?MINE:METAL;
const INCI=[["inci-beyaz","İnci beyaz",[0.93,0.91,0.87]],["inci-krem","İnci krem",[0.93,0.85,0.7]],["inci-pembe","İnci pembe",[0.94,0.8,0.8]],["inci-gri","İnci gri",[0.6,0.61,0.64]],["inci-siyah","İnci siyah",[0.16,0.16,0.19]]];
const TOPL=INCI.map(x=>[x[0],x[1],x[2],x[2].map(c=>Math.pow(c,2.2)),4]).concat(TAS.filter(t=>t[2]).map(t=>["tas-"+t[0],t[1],t[2],t[2].map(c=>Math.pow(c,1.6)),5]),[["altin","Altın top",METAL[0][2],METAL[0][3],0]]);   // [anahtar, ad, örnek, renk, tür]
const topBul=k=>{ if(!k) return null; const m=/^tas-(.+)$/.exec(k); return TOPL.find(t=>t[0]===(m?"tas-"+(RENK_ESA[m[1]]||m[1]):k)); };   // "tas-koyu_kirmizi" → taş boncuk garnet
function adresRenk(){ const a=adresParca(), A={}; if(adresUrun()===urun.kod) (a.get("renk")||"").split(",").forEach(x=>{ const [k,v]=x.split(":"); if(k&&v) A[k]=v; }); return A; }
function renkKur(){ const R=urun.rg, A=adresRenk(); RS=[]; topSecildi=!!A.top; TOP=urun.top?(topBul(A.top||urun.top)||topBul(urun.top)||TOPL[0]):null; if(!R) return;
  R.forEach((g,i)=>{ const L=renkListe(g); RS[i]=L.find(m=>m[0]===(A[g.k]||g.v))||L.find(m=>m[0]===g.v)||L[0]; }); }
function renkAdres(){ if(GOMULU||!(urun.rg||urun.top)) return; const a=adresParca(); a.set("urun",urun.kisa||urun.kod);
  const deg=(urun.rg||[]).map((g,i)=>RS[i][0]!==g.v?g.k+":"+RS[i][0]:null).filter(Boolean); if(TOP&&TOP[0]!==urun.top) deg.push("top:"+TOP[0]);
  if(deg.length) a.set("renk",deg.join(",")); else a.delete("renk");
  try{ history.replaceState(null,"","#"+a.toString().replace(/%3A/g,":").replace(/%2C/g,",")); }catch(e){} }
function izgaraKur(kap,baslik,L,secili,ver,uc){ const h=document.createElement("h2"); h.textContent=baslik; kap.appendChild(h);
  const z=document.createElement("div"); z.className="izgara"+(uc?" uc":""); z.setAttribute("role","group"); z.setAttribute("aria-label",baslik);
  L.forEach(m=>{ const d=document.createElement("button"); d.type="button"; d.innerHTML='<span class="nokta" style="background:rgb('+m[2].map(x=>Math.round(x*255)).join(",")+')"></span><span></span>'; d.lastChild.textContent=m[1];
    d.setAttribute("aria-pressed",secili(m)); d.addEventListener("click",()=>{ ver(m); renkAdres(); renkCiz(); }); z.appendChild(d); }); kap.appendChild(z); }
function renkCiz(){ const R=urun.rg, B=$("b-renk"), T=$("b-top"); B.textContent=""; T.textContent=""; B.hidden=!R; T.hidden=!urun.top;
  $("metaller").hidden=$("metal-b").hidden=!!(R&&R.some(g=>!g.m));   // yalnız mine grubu varsa gövde metali seçimi kalır
  if(R){ const met=R.filter(g=>!g.m);
    if(met.length>1) izgaraKur(B,"Metal · hepsi",METAL,m=>R.every((g,i)=>g.m||RS[i]===m),m=>{ R.forEach((g,i)=>{ if(!g.m) RS[i]=m; }); metal=m; },true);
    R.forEach((g,i)=>izgaraKur(B,g.m?g.ad+" · mine":g.ad+" · metal",renkListe(g),m=>RS[i]===m,m=>{ RS[i]=m; },!g.m)); }
  if(urun.top) izgaraKur(T,"Top",TOPL,m=>TOP===m,m=>{ TOP=m; topSecildi=true; },false); }
function uretimCiz(){ const U_=urun.uretim, B=$("uretim"); B.textContent=""; B.hidden=!U_; const vc=$("v-calisma"), vu=$("v-uretim"); vu.hidden=!(U_&&U_.n&&U_.n[0]); vc.textContent=vu.hidden?"":U_.n[0]; if(!U_) return;   /* Vitrin: kısa "Üretim" satırı (notların ilki) */
  const h=document.createElement("h2"); h.textContent="Üretim"; B.appendChild(h);
  const satir=(a,b)=>{ const d=document.createElement("div"); d.className="satir"; d.innerHTML='<span></span><span class="deger"></span>'; d.children[0].textContent=a; d.children[1].textContent=b; B.appendChild(d); };
  if(U_.d!=null) satir("Döküm parça",U_.d); (U_.h||[]).forEach(([a,n])=>satir(a,n+" adet"));
  (U_.n||[]).forEach(t=>{ const e=document.createElement("p"); e.className="tanim"; e.textContent=t; B.appendChild(e); }); }
const ROZET={gecme:"GEÇME",pim:"PİM",lazer:"LAZER",mihlama:"MIHLAMA",hazir:"HAZIR PARÇA"};
/* MONTAJ ADIMLARI (u.montaj): liste satırları adımların kendisi; kaydırıcı 1→0 (Birleşik→Parçalı) adımları sondan başa ayırır, 0→1 sırayla oturtur.
   Satıra tıklayınca (ya da ↑/↓) satır açılır, açıklama okunur, o adımın parçaları vurgulanır ve yerine oturur (öncekiler yerinde, sonrakiler ayrık). */
const adimNo=q=>q.ms>=0?q.ms:(q._ev&&q._ev.ms>=0?q._ev.ms:0);
function etkenQ(q){ if(!urun.montaj) return etken(q.g); const i=adimNo(q), n=urun.montaj.length; return 1-ease(clamp(p*n-i,0,1)); }
function montajSure(){ return Math.min(6,Math.max(1.6,0.42*urun.montaj.length)); }
/* Parçalı/adım: baskın takılma ekseni bakış yönüyle 35°'den dar açı yapıyorsa kamera yumuşakça ~57°'lik 3/4 görünüşe döner; Birleşik'te önceki bakışa geri gelir. Yon alanı olmayan eski setlerde çalışmaz. */
let kamH=null, kamOnce=null;
function eksenAci(sp,yn){ const v=rt(Rkur(sp,yn,urun.taban),[0,0,1]); return Math.acos(Math.min(1,Math.abs(ic(v,urun._eks))))*180/Math.PI; }
function kamAc(){ if(!urun||!urun._eks||kamOnce||eksenAci(sapma,yunus)>=35) return; kamOnce=[sapma,yunus]; let en=null;
  for(let ds=-1.3;ds<=1.31;ds+=0.05) for(let dy=-0.9;dy<=0.91;dy+=0.05){ const y=clamp(yunus+dy,-1.45,1.45), c=Math.abs(eksenAci(sapma+ds,y)-57)+6*Math.hypot(ds,1.4*dy); if(!en||c<en[0]) en=[c,sapma+ds,y]; }
  kamH=[en[1],en[2]]; }
function kamGeri(){ if(kamOnce){ kamH=kamOnce; kamOnce=null; } }
function aktifAc(i,oynat){ const n=urun.montaj.length; i=clamp(i,0,n-1); aktifA=i;
  for(const li of $("liste").children) li.dataset.acik=li.dataset.i==i?1:0;
  if(oynat){ kamAc(); oynA=Math.min(p,i/n); oynB=(i+1)/n; if(azHareket) oynA=oynB; oynSure=0.9; oynT0=performance.now(); oynuyor=true; } adimYaz(); }
let mekGor=false;
const mekGorAcik=()=>mekGor&&mod==="montaj"&&!!(urun&&urun.mek&&urun.mek.length);
const mekVurgu=q=>/^(pim|mil|mentese|kilit|percin|aks)/.test(q.id||"")||q.kn>=0;   // mekanizma görünümünde vurgulu: pimler, miller, kilit
function durumHesap(){ const M_=urun.montaj; if(!M_||!M_.some(m=>m.du)) return null; const n=M_.length, x=clamp(p*n,0,n-1e-6), i=Math.floor(x), t=ease(x-i), D={};
  const S_=(j,k)=>{ for(let q=j;q>=0;q--) if(M_[q].du&&M_[q].du[k]!=null) return M_[q].du[k]; return 0; };
  const K_=new Set(); M_.forEach(m=>{ if(m.du) Object.keys(m.du).forEach(k=>K_.add(k)); });
  K_.forEach(k=>{ const a0=S_(i-1,k), a1=S_(i,k); D[k]=a0+(a1-a0)*t; }); return D; }   // adım ilerledikçe mekanizma "durum" açısına yumuşakça gelir
function mekKatman(){ const k=$("mek-katman"), on=mekGorAcik()&&!!KAM&&!!MKT; if(k.hidden!==!on) k.hidden=!on; if(!on) return;
  const w=cv.clientWidth, h=cv.clientHeight, dp=devicePixelRatio||1; if(k.width!==Math.round(w*dp)||k.height!==Math.round(h*dp)){ k.width=Math.round(w*dp); k.height=Math.round(h*dp); }
  const c=k.getContext("2d"); c.setTransform(dp,0,0,dp,0,0); c.clearRect(0,0,w,h); c.lineWidth=1.3; c.strokeStyle="#e8714d"; c.fillStyle="#e8714d";
  urun.mek.forEach((n,j)=>{ if(n.t==="s") return; const P=n.u>=0?MKT[n.u]:{M:KIM,t:[0,0,0]}, em=mv(P.M,n.e), pv=top3(mv(P.M,n.c),P.t);
    let r=urun.olc*0.06; urun.parcalar.forEach(q=>{ if(q.mk===j) r=Math.max(r,Math.min(Math.hypot(q.y[0],q.y[1],q.y[2])*0.55,urun.olc*0.3)); });
    const a=ekranaM(top3(pv,carp(em,-r*1.15))), b=ekranaM(top3(pv,carp(em,r*1.15))); c.setLineDash([]); c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke();   // dönme ekseni
    let ref=cap(em,[0,1,0]); if(Math.hypot(ref[0],ref[1],ref[2])<0.3) ref=cap(em,[1,0,0]); ref=birim(ref); const r2=cap(em,ref), s0=n.s?n.s[0]:-Math.PI, s1=n.s?n.s[1]:Math.PI, rr=r*0.6;
    c.setLineDash(n.s?[]:[3,3]); c.beginPath(); for(let i=0;i<=28;i++){ const t=s0+(s1-s0)*i/28, q=ekranaM(top3(pv,top3(carp(ref,Math.cos(t)*rr),carp(r2,Math.sin(t)*rr)))); if(i) c.lineTo(q[0],q[1]); else c.moveTo(q[0],q[1]); } c.stroke();   // izinli açı yayı (sınırsızsa kesikli çember)
    const at=MKS[j]?MKS[j].a:0, q=ekranaM(top3(pv,top3(carp(ref,Math.cos(at)*rr),carp(r2,Math.sin(at)*rr)))); c.beginPath(); c.arc(q[0],q[1],2.4,0,6.2832); c.fill(); }); }
function kapakDurum(){ if(!urun.montaj||!urun.mek||urun.montaj.some(m=>m.du)) return; const n=urun.montaj.length;
  urun.mek.forEach(m=>{ if(m.t!=="s"||!m.kap.ac) return; const q=urun.parcalar.find(x=>x.mk>=0&&urun.mek[x.mk]===m); if(!q) return; const i=adimNo(q), k=m.kap.kp;
    MKS[k].h=(mod==="montaj"&&p<0.999&&p*n>i-1&&p*n<i+1)?urun.mek[k].s[1]:urun.mek[k].s[0]; }); }   // içine konan parçanın adımı çevresinde kapak açık
let MKS=[], MKT=null, KAM=null, MSR=null, MKP=[], esSapM=0, esYunM=0, yuzT=-1;
function mekKurDurum(){ const N=urun.mek||[]; MKS=N.map(n=>({a:n.o?n.o.f:0,w:0,wa:0,r:n.t==="s"?cik(n.c,n.kap.c):null,v:[0,0,0],Q:KIM,F:null}));
  N.forEach(n=>{ n._h=0; }); for(let k=N.length-1;k>=0;k--){ const u_=N[k].u; if(u_>=0) N[u_]._h=Math.max(N[u_]._h,N[k]._h+1); } N.forEach(n=>{ n._uc=1/(1+n._h); });
  const KP=N.map((n,k)=>n.kp?k:-1).filter(k=>k>=0);   // kapak: kadraj kapalı + açık hâlin birleşik kutusuna göre (açıkken de sığsın; ürün odak kaydı yoksa)
  if(KP.length&&!urun.odak){ const lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9];
    for(const ac of [0,1]){ KP.forEach(k=>{ MKS[k].a=ac?N[k].s[1]:0; }); const T=mekDonusum();
      urun.parcalar.forEach(q=>{ const T_=q.mk>=0?T[q.mk]:null; for(let i=0;i<8;i++){ let c=[q.c[0]+(i&1?1:-1)*q.y[0],q.c[1]+(i&2?1:-1)*q.y[1],q.c[2]+(i&4?1:-1)*q.y[2]]; if(T_) c=top3(mv(T_.M,c),T_.t); for(let a=0;a<3;a++){ lo[a]=Math.min(lo[a],c[a]); hi[a]=Math.max(hi[a],c[a]); } } }); }
    KP.forEach(k=>{ MKS[k].a=0; }); urun.odak={m:[0,1,2].map(a=>(lo[a]+hi[a])/2), b:Math.max(hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2])*1.02}; odakK=mod!=="montaj"?1:0; }
  MKT=null; MSR=null; yuzT=-1; esSapM=sapma; esYunM=yunus;
  MKP=N.map(()=>[]); urun.parcalar.forEach(q=>{ if(q.mk>=0){ const m=Math.max(1e-3,8*q.y[0]*q.y[1]*q.y[2]); for(let k=q.mk;k>=0;k=N[k].u) MKP[k].push([q,m]); } }); }
function mekDonusum(){ const N=urun.mek; if(!N||!N.length) return null; const T=[];
  N.forEach((n,k)=>{ const st=MKS[k], P=n.u>=0?T[n.u]:{M:KIM,t:[0,0,0]};
    if(n.t==="s"){ const c0=n.c, d=top3(cik(st.r,cik(c0,n.kap.c)),[0,0,0]); T[k]={M:mm(P.M,st.Q),t:top3(mv(P.M,top3(cik(c0,mv(st.Q,c0)),d)),P.t)}; }
    else { const Rk=eksenDon(n.e,st.a); T[k]={M:mm(P.M,Rk),t:top3(mv(P.M,cik(n.c,mv(Rk,n.c))),P.t)}; } }); return T; }
const ters3=m=>{ const [a,b,c,d,e,f,g,h,i]=m, A=e*i-f*h, B=-(d*i-f*g), C_=d*h-e*g, det=a*A+b*B+c*C_||1e-12;
  return [A/det,-(b*i-c*h)/det,(b*f-c*e)/det, B/det,(a*i-c*g)/det,-(a*f-c*d)/det, C_/det,-(a*h-b*g)/det,(a*e-b*d)/det]; };
function mekAdim(dt,R){ const N=urun.mek; if(!N||!N.length) return; const dS=sapma-esSapM, dY=yunus-esYunM; esSapM=sapma; esYunM=yunus;
  if(p<0.999){ const D=durumHesap(); if(D){ for(const k in D){ const st=MKS[k]; st.a=D[k]; st.h=D[k]; st.w=0; st.wa=0; } MKT=mekDonusum(); return; }
    let d=false; N.forEach((n,k)=>{ if(n.kp){ const st=MKS[k]; st.a+=((st.h||0)-st.a)*(1-Math.exp(-5*dt)); st.w=0; st.wa=0; d=true; } }); if(d) MKT=mekDonusum(); return; }   // montajda ayrıkken durur; yalnız kapak açılır/kapanır
  if(!MKT) MKT=mekDonusum();
  N.forEach((n,k)=>{ if(!n.kl) return; const st=MKS[k]; st.kl=st.kl||0;   // kilit: açarken önce kilit parçası çekilir, sonra kapak açılır; kapanınca kilit geri girer
    if(st.istek==="ac"){ st.kl=Math.min(1,st.kl+dt/0.45); if(st.kl>=1) st.h=n.s?n.s[1]:st.h; }
    else if(st.istek==="kapa"){ st.h=n.s?n.s[0]:0; if(Math.abs(st.a-st.h)<0.05&&Math.abs(st.w)<0.8){ st.a=st.h; st.w=0; st.wa=0; st.kl=Math.max(0,st.kl-dt/0.45); } } });   /* tam kapanınca oturur, sonra kilit girer */   // montajda ayrıkken durur; birleşince kaldığı yerden sürer
  const oto=fizikAcik&&!azHareket, CEK=oto&&yerCekimi?GUC[guc]:0, fr=CANLI[canli][1]*0.4, ex=rt(R,[1,0,0]), ey=rt(R,[0,Math.cos(yunus),Math.sin(yunus)]);
  const Om=carp(top3(carp(ey,dS),carp(ex,dY)),1/Math.max(dt,1e-3)), g=rt(R,[0,-1,0]), adim=Math.max(1,Math.min(6,Math.round(dt/0.006))), h=dt/adim;
  if(yuzT>=0){ yuzT+=dt; if(yuzT>4.5) yuzT=-1; } const yz=yuzT;   // yüzdürme dalgası: benzetim saatiyle
  for(let s=0;s<adim;s++){ const W=[];
    N.forEach((n,k)=>{ const st=MKS[k], P=n.u>=0?MKT[n.u]:{M:KIM,t:[0,0,0]}, Wp=n.u>=0?W[n.u]:Om, em=mv(P.M,n.e), Pr=ic(Wp,em);
      if(n.t==="s"){ // serbest inci: dünyada yerinde kalmak ister; kapta yerçekimiyle yuvarlanır
        const Fn=mm(R.length?[R[0],R[3],R[6],R[1],R[4],R[7],R[2],R[5],R[8]]:KIM,P.M);
        if(st.F){ const D=mm([Fn[0],Fn[3],Fn[6],Fn[1],Fn[4],Fn[7],Fn[2],Fn[5],Fn[8]],st.F); if(oto){ st.r=mv(D,st.r); st.v=mv(D,st.v); } } st.F=Fn;
        const gl_=mv([P.M[0],P.M[3],P.M[6],P.M[1],P.M[4],P.M[7],P.M[2],P.M[5],P.M[8]],g); st.v=carp(top3(st.v,carp(gl_,CEK*h)),Math.exp(-0.6*h)); const eski=st.r; st.r=top3(st.r,carp(st.v,h));
        const L=n.kap.r-n.gr, l=Math.hypot(...st.r); if(l>L){ const nn=carp(st.r,1/l); st.r=carp(nn,L); const vn=ic(st.v,nn); if(vn>0) st.v=cik(st.v,carp(nn,vn*1.25)); st.v=carp(st.v,0.997);
          const dx=cik(st.r,eski), dl=Math.hypot(...dx); if(dl>1e-6) st.Q=mm(eksenDon(birim(cap(nn,dx)),-dl/n.gr),st.Q); }
        if(n.kap.ac&&MKS[n.kap.kp].a>0.12){ const ac=n.kap.ac, d_=ic(st.r,ac); if(d_>0){ st.r=cik(st.r,carp(ac,d_)); const vn=ic(st.v,ac); if(vn>0) st.v=cik(st.v,carp(ac,vn*1.2)); } }   // kapak açık: inci alt çanakta kalır
        W[k]=Wp; return; }
      if(n.kl&&!(st.kl>=0.999)){ st.w=0; st.wa=Pr; W[k]=Wp; return; }   // kilitli: kıpırdamaz
      if(n.o){ const K=MKS[n.o.k]; st.a=K.a*n.o.c+n.o.f; st.w=K.w*n.o.c; st.wa=Pr+st.w; W[k]=top3(Wp,carp(em,st.w)); return; }
      let al=0;
      if(CEK&&n.t!=="m"&&MKP[k].length){ const pv=top3(mv(P.M,n.c),P.t); let tq=0,I=0; for(const [q,m] of MKP[k]){ const T_=MKT[q.mk], r=cik(top3(mv(T_.M,q.c),T_.t),pv), rp=cik(r,carp(em,ic(r,em)));
          tq+=m*ic(em,cap(r,g)); I+=m*(ic(rp,rp)+0.3*(q.y[0]*q.y[0]+q.y[1]*q.y[1]+q.y[2]*q.y[2])); } al+=CEK*tq/Math.max(I,1e-6); }
      if(n.t==="m"&&n.kp){ al+=-30*(st.a-(st.h||0))-9*st.w; }   // kapak: düğmeyle açık/kapalı hedefe gider
      else if(n.t==="m"){ const lim=(n.s[1]-n.s[0])/2, dp=(()=>{ let d=0; for(let j=n.u;j>=0;j=N[j].u) d++; return d; })();
        const uc=n._uc, yer=dp/Math.max(1,dp+n._h), zarf=0.55+0.5*yer, K=yz>=0?150:28;   // uc: zincir sonuna yakınlık (son düğüm 1); yer: baştan kuyruğa 0→1 (dalga kuyruğa doğru büyür; sönümle birlikte eklem başına sınırın ~%50–65 i)
        const hd=yz>=0?0.9*lim*zarf*Math.sin(2*Math.PI*yz/1.1-0.7*dp)*Math.sin(Math.PI*Math.min(1,yz/4.5)):0;
        al+=-K*(st.a-hd)-2*Math.sqrt(K)*(0.75+0.6*uc)*st.w;   // kritik sönüm, uçta daha fazla: kuyruk çırpınmaz
        const yum=0.8*n.s[1]; if(Math.abs(st.a)>yum) al+=-260*(Math.abs(st.a)-yum)*Math.sign(st.a)-6*st.w; }   // yumuşak sınır: dayanmadan yavaşlar
      if(!oto) st.wa=Pr+st.w*Math.exp(-6*h); else st.wa+=(Pr-st.wa)*(1-Math.exp(-(n.f?fr:n.t==="m"?10:fr*5)*h));   // mafsal: büyük ölçüde üstüyle gider (zincir boyunca kamçı birikmesin)   // serbest: yalnız yatak sürtünmesi
      st.wa+=al*h; st.w=clamp(st.wa-Pr,-30,30); st.wa=Pr+st.w; st.a+=st.w*h;
      if(n.s){ const e_=n.t==="m"?0:0.2; if(st.a<n.s[0]){ st.a=n.s[0]; st.w=Math.max(0,st.w)*e_; st.wa=Pr+st.w; } else if(st.a>n.s[1]){ st.a=n.s[1]; st.w=Math.min(0,st.w)*e_; st.wa=Pr+st.w; } }
      W[k]=top3(Wp,carp(em,st.w)); });
    MKT=mekDonusum(); } }
let ilkDg=null;
function dugmeKur(){ for(const b of [...document.querySelectorAll(".ek-dg")]) b.remove(); ilkDg=null; if(!MKS.length) return;
  const D=[...new Set(urun.mek.map(n=>n.dg).filter(Boolean))]; ilkDg=D[0]||null; const R_=$("r-doner");
  D.slice(1).forEach(t=>{ const b=document.createElement("button"); b.className="ek-dg"; b.type="button"; b.textContent=t; b.addEventListener("click",()=>mekItki(t)); R_.appendChild(b); }); }
function mekItki(dg){ if(!MKS.length) return; const N=urun.mek; let maf=false;
  N.forEach((n,k)=>{ const st=MKS[k]; if(dg&&n.dg&&n.dg!==dg) return; if(n.kp&&n.kl){ st.istek=st.istek==="ac"?"kapa":"ac"; return; } if(n.kp){ st.h=(st.h||0)>n.s[0]+1e-3?n.s[0]:n.s[1]; return; } if(n.t==="m") maf=true; else if(n.t==="s") st.v=top3(st.v,[(Math.random()-.5)*90,40+Math.random()*40,(Math.random()-.5)*90]);
    else if(!n.o) st.wa+=(Math.random()<.5?-1:1)*(3+4*Math.random()); });
  if(maf) yuzT=0; }
function ekranaM(m){ const K=KAM, q=top3(rd(K.R,m),K.T); return [(K.f/K.en*q[0]/-q[2]*.5+.5)*cv.clientWidth,(1-(K.f*q[1]/-q[2]*.5+.5))*cv.clientHeight]; }
function mekSec(e){ if(!KAM) return null; const b=cv.getBoundingClientRect(), x=((e.clientX-b.left)/b.width)*2-1, y=1-((e.clientY-b.top)/b.height)*2, K=KAM;
  const Rt=[K.R[0],K.R[3],K.R[6],K.R[1],K.R[4],K.R[7],K.R[2],K.R[5],K.R[8]], o=rd(Rt,carp(K.T,-1)), d=rd(Rt,[x*K.en/K.f,y/K.f,-1]); let en=null;
  for(const q of urun.parcalar){ if(!(q.mk>=0)||!q._M||gizli[q.g]) continue; const a=ag[urun.kod][Array.isArray(q.m)?q.m[0]:q.m]; if(!a.P) continue;
    const Mi=ters3(q._M), o2=mv(Mi,cik(o,q._T)), d2=mv(Mi,d), P=a.P, I=a.I;
    for(let i=0;i<I.length;i+=3){ const A=I[i]*3,B=I[i+1]*3,C=I[i+2]*3, e1=[P[B]-P[A],P[B+1]-P[A+1],P[B+2]-P[A+2]], e2=[P[C]-P[A],P[C+1]-P[A+1],P[C+2]-P[A+2]], pv=cap(d2,e2), det=ic(e1,pv);
      if(Math.abs(det)<1e-12) continue; const iv=1/det, tv=cik(o2,[P[A],P[A+1],P[A+2]]), u=ic(tv,pv)*iv; if(u<0||u>1) continue; const qv=cap(tv,e1), v=ic(d2,qv)*iv; if(v<0||u+v>1) continue;
      const t=ic(e2,qv)*iv; if(t>0&&(!en||t<en.t)) en={t,q,hl:top3(o2,carp(d2,t))}; } }
  if(!en) return null; let k=en.q.mk; if(urun.mek[k].t==="s") return null; return {k,q:en.q,hl:en.hl}; }
function mekSurukle(e){ if(urun.mek[MSR.k].kl&&!(MKS[MSR.k].kl>=0.999)) return; const S=MSR, N=urun.mek, n=N[S.k], P=n.u>=0?MKT[n.u]:{M:KIM,t:[0,0,0]}, em=mv(P.M,n.e), pv=top3(mv(P.M,n.c),P.t), hm=top3(mv(S.q._M,S.hl),S.q._T);
  const s0=ekranaM(hm), s1=ekranaM(top3(hm,carp(cap(em,cik(hm,pv)),0.02))), tx=(s1[0]-s0[0])/0.02, ty=(s1[1]-s0[1])/0.02, t2=tx*tx+ty*ty;
  const dx=e.clientX-S.x, dy=e.clientY-S.y, an=performance.now(), dtt=Math.max(0.008,(an-S.t)/1000); S.x=e.clientX; S.y=e.clientY; S.t=an; sonDokunus=an; if(t2<4) return;
  let da=clamp((dx*tx+dy*ty)/t2,-0.6,0.6), k=S.k;
  if(n.o){ let c=1; while(N[k].o){ c*=N[k].o.c; k=N[k].o.k; } da/=c; }
  const yay_=(j,f)=>{ const st=MKS[j], m=N[j]; st.a+=da*f; if(m.s) st.a=clamp(st.a,m.s[0],m.s[1]); st.w=da*f/dtt*0.6; st.wa=st.w+(st.wa-st.w); };
  yay_(k,1); if(N[k].t==="m"){ let j=N[k].u, f=0.45; while(j>=0&&f>0.05){ yay_(j,f); j=N[j].u; f*=0.5; } }
  MKT=mekDonusum(); }
function adimYaz(){ const M_=urun.montaj, n=M_?M_.length:sira.length, i=Math.min(n-1,Math.floor(p*n)), g=M_?{ad:M_[i].b}:urun.gruplar[sira[i]];
  if(M_){ const et=p>=0.999?-1:i; for(const li of $("liste").children) li.dataset.etkin=li.dataset.i==et?1:0; kapakDurum(); }
  $("adim").innerHTML=p>=0.999?"<b>✓</b>Birleşik":p<=0.001?"<b>0/"+n+"</b>Parçalı":"<b>"+(i+1)+"/"+n+"</b>"+g.ad;
  $("zaman").value=Math.round((1-p)*1000); $("dolu").style.setProperty("--v",((1-p)*100).toFixed(1)+"%"); $("oynat").textContent=(oynuyor?oynB<0.5:p>0.5)?"Parçala":"Birleştir"; }
let son=0; function kare(t){ const dt=clamp((t-son)/1000,0.001,0.05); son=t;
  if(oynuyor){ const u=clamp((t-oynT0)/1000/oynSure,0,1); p=oynA+(oynB-oynA)*ease(u); if(u>=1) oynuyor=false; adimYaz(); }
  if(kamH&&!basili.size){ const k=1-Math.exp(-(azHareket?60:3.5)*dt); sapma+=(kamH[0]-sapma)*k; yunus+=(kamH[1]-yunus)*k; if(Math.abs(kamH[0]-sapma)+Math.abs(kamH[1]-yunus)<0.002) kamH=null; }
  if(!basili.size){ sapma+=hs*dt; yunus=clamp(yunus+hy*dt,-3.1,3.1); const s=Math.exp(-3.2*dt); hs*=s; hy*=s;   // bırakınca dönüş yavaşlayarak sürer
    if(mod==="vitrin"&&donIstek&&t-sonDokunus>2500) sapma+=dt*0.22; }
  if(gorunur&&!document.hidden){ ciz(dt); mekKatman(); } requestAnimationFrame(kare); }
function bak(ad){ const b=urun.bakis[ad]; kamH=null; kamOnce=null; sapma=b[0]; yunus=b[1]; kay=[0,0]; hs=hy=0; esSap=sapma; esYun=yunus; sonDokunus=performance.now(); }
function sarkacKur(){ const S=urun.sarkac, A_=ag[urun.kod];
  FZ=S.map(s=>({x:null,xp:null,pw:null,pp:s.piv,d:s.d0,Q:KIM,f:0,fv:0,dv:null,lo:[1e9,1e9,1e9],hi:[-1e9,-1e9,-1e9],Lc:s.L}));
  urun.parcalar.forEach(pc=>{ if(pc.pd<0) return; const a=A_[Array.isArray(pc.m)?pc.m[0]:pc.m], A=pc.A||KIM, st=FZ[pc.pd];
    for(let k=0;k<3;k++){ const y=Math.abs(A[3*k])*a.yari[0]+Math.abs(A[3*k+1])*a.yari[1]+Math.abs(A[3*k+2])*a.yari[2]; st.lo[k]=Math.min(st.lo[k],pc.c[k]-y); st.hi[k]=Math.max(st.hi[k],pc.c[k]+y); } });
  FZ.forEach((st,i)=>{ st.mer=[0,1,2].map(k=>(st.lo[k]+st.hi[k])/2); st.yari=[0,1,2].map(k=>(st.hi[k]-st.lo[k])/2); st.Lc=Math.max(0.5,ic(cik(st.mer,S[i].piv),S[i].d0)); });
  CIFT=[]; for(let i=0;i<S.length;i++) for(let j=i+1;j<S.length;j++){ if(S[i].par!==S[j].par) continue; const a=FZ[i], b=FZ[j], ar=cik(b.mer,a.mer), D0=Math.hypot(ar[0],ar[1],ar[2]); if(D0<1e-6) continue;
    const u=carp(ar,1/D0), r=k=>Math.abs(u[0])*k.yari[0]+Math.abs(u[1])*k.yari[1]+Math.abs(u[2])*k.yari[2], rr=r(a)+r(b);
    if(D0-rr<0.52*(a.Lc+b.Lc)) CIFT.push([i,j,rr>D0?D0*0.9:rr*0.9]); } }
function teknikYaz(){ const G=urun.gruplar, s=urun.boyut.map(x=>String(x).replace(".",",")), yon=urun.taban==="-z"?[s[0],s[2],s[1]]:s, say=t=>G.filter(g=>g.tur===t).reduce((a,g)=>a+g.adet,0);
  const satir=(a,b)=>'<div class="satir"><span>'+a+'</span><span class="deger">'+b+'</span></div>', ucgen=urun.aglar.reduce((a,m,i)=>a+(urun.parcalar.some(q=>(q.rl===2||q.rl===3)&&[].concat(q.m).includes(i))?0:m.nf),0);   /* demo ve mine ağı sayılmaz */
  $("t-kunye").innerHTML=satir("Ölçü (G × Y × D)",yon.join(" × ")+" mm")+urun.gram.split(" · ").map(x=>{ const i=x.indexOf(" "); return satir(x.slice(0,i),x.slice(i+1)); }).join("")+
    satir("Döküm parça",say("dokum"))+satir("Hazır parça",say("hazir"))+satir("Taş",say("tas"))+satir("Sallanan parça",urun.sarkac.length||"yok")+satir("Ön izleme ağı",ucgen.toLocaleString("tr-TR")+" üçgen");
  $("t-parca").innerHTML=sira.map((gi,k)=>satir((k+1)+" · "+G[gi].ad,G[gi].adet+" × "+TUR[G[gi].tur])).join(""); }
function sec(kod){ urun=MAN.find(u=>u.kod===kod); const G=urun.gruplar; gizli=G.map(()=>false); sarkacKur(); DN=(urun.doner||[]).map(d=>({f:d.sin?d.sin[0]:0,w:0,h:d.sin?d.sin[0]:0})); esSapD=sapma; esYunD=yunus;
  mekKurDurum(); sira=patlatKur(); renkKur(); gizliA=(urun.montaj||[]).map(()=>false); aktifA=-1;
  { const b=document.querySelector('#modlar [data-mod="montaj"]'), tek=urun.parcalar.filter(q=>!q.rl).length<2; b.hidden=tek; if(tek&&mod==="montaj") modSec("vitrin"); }
  for(const d of $("sekme").children) d.setAttribute("aria-pressed",d.dataset.kod===kod);
  odakK=urun.odak&&mod!=="montaj"?1:0; $("cevir").textContent=urun.donen_dugme||"Dümeni çevir"; sekmeGoster();
  bak(urun.bakis.ilk); yakin=urun.bakis.yakin; p=1; oynuyor=false;
  const L=$("liste"), E=$("etiketler"); L.textContent=""; E.textContent=""; etEl=[];
  sira.forEach((gi,k)=>{ const g=G[gi], li=document.createElement("li");
    li.innerHTML='<span class="no">'+(k+1)+'</span><span class="ad"></span><span class="tur"></span>'; li.children[1].textContent=g.ad+" × "+g.adet; li.children[2].textContent=TUR[g.tur];
    const d=document.createElement("button"); d.textContent="Gizle"; d.setAttribute("aria-pressed","false"); d.id="gz-"+kod+"-"+gi;
    d.addEventListener("click",()=>{ gizli[gi]=!gizli[gi]; d.textContent=gizli[gi]?"Göster":"Gizle"; d.setAttribute("aria-pressed",gizli[gi]); li.dataset.gizli=gizli[gi]?1:0; });
    li.appendChild(d); L.appendChild(li);
    const e=document.createElement("div"); e.className="et"; e.hidden=true; e.innerHTML="<b>"+(k+1)+"</b><span></span>"; e.children[1].textContent=g.ad+(g.adet>1?" × "+g.adet:""); E.appendChild(e); etEl[gi]=e; });
  const s=urun.boyut.map(x=>String(x).replace(".",",")), yon=urun.taban==="-z"?[s[0],s[2],s[1]]:s;
  $("r-bag").hidden=!urun.kisa; $("bag").textContent="Bağlantıyı kopyala";
  $("k-ad").textContent=urun.ad; $("k-olcu").textContent=(urun.kisa?urun.kisa+" · ":"")+yon[0]+" × "+yon[1]+" × "+yon[2]+" mm · "+urun.gram;
  $("v-ad").textContent=urun.ad; $("v-tanim").textContent=urun.tanim||"";
  $("r-fizik").hidden=$("r-canli").hidden=$("ayar-fizik").hidden=!urun.sarkac.length; $("r-doner").hidden=!DN.length&&!MKS.length; if(MKS.length){ const n=urun.mek.find(x=>x.dg); $("ayar-fizik").hidden=false; setTimeout(()=>{ $("cevir").textContent=(n&&n.dg)||(urun.mek.some(m=>m.t==="m"&&!m.kp)?"Yüzdür":"Çevir"); });   /* düğme yazısı yoksa: mafsal zinciri "Yüzdür" */ }
  // malzeme paneli ürüne göre: taş yoksa taş seçimi yok; büyük-küçük ayrımı yoksa "küçük taşlar renksiz" yok; dönen parça varsa ona ayrı metal
  { const taslar=urun.parcalar.filter(q=>G[q.g].tur==="tas"&&!q.tp), varT=taslar.length>0; ayrim=taslar.some(q=>q.k)&&taslar.some(q=>!q.k);
    $("b-tas").hidden=!varT; $("r-kucuk").hidden=!ayrim; $("tas-b").textContent=ayrim?"Ana taş":"Taş"; $("b-metal2").hidden=!DN.length;
    if(!tasSecildi){ tas=tasBul(urun.tas)||TAS[0]; for(const k of $("taslar").children) k.setAttribute("aria-pressed",k.id==="taslar-"+tas[0]); }
    $("malzeme-not").textContent=varT?"Renk yalnız görünümdür; ölçüler aynı kalır. Taş yoğunluğu değişirse takılan ağırlık biraz oynar.":"Renk yalnız görünümdür; ölçüler aynı kalır. Bu modelde taş yok."; } teknikYaz(); adimYaz(); $("r-mek").hidden=!(urun.mek&&urun.mek.some(n=>n.t!=="s")); if(urun.montaj) montajListe(); renkCiz(); uretimCiz(); dugmeKur(); adimYaz(); yzKip=urun.yi?"isaret":null; dsSifirla(); yzKur(); dsAdresOku(); dsKur(); yzYaz(); mnSifirla(); mnAdresOku(); mnKur(); mnYaz(); sakla("urun",kod); }
/* ── YÜZEY İŞLEMİ (u.yi; parça rl 1 yüzey grubu, 2 demo; dp döküm parçası). Vitrin ve Malzeme'de üçlü seçim: Döküm (grup gövdeyle aynı metal),
   Kesim bölgesi (grup kiremit yarı saydam boyalı, kenarı çizgili, sahnede "Elmas kesim" etiketi; açılış), Kesimden sonra (grup gizli, demo düz
   fasetlerle). Montaj ve Teknik her zaman döküm hâlini gösterir; demo orada çizilmez. Alan yoksa hiçbir şey görünmez. */
const yzGor=()=>urun&&urun.yi&&(mod==="vitrin"||mod==="malzeme")?yzKip:"dokum";
function yzSinir(a){ if(a._yz) return a._yz; const P=a.P, I=a.I; if(!P) return a._yz={n:0};   // yüzey grubunun kenarı (çerçeve çizgisi), orta noktası ve ortalama normali
  const kim=new Map(), K=new Uint32Array(P.length/3);
  for(let i=0;i<K.length;i++){ const k=Math.round(P[3*i]*2e3)+","+Math.round(P[3*i+1]*2e3)+","+Math.round(P[3*i+2]*2e3); if(!kim.has(k)) kim.set(k,i); K[i]=kim.get(k); }
  const E=new Map(); let nr=[0,0,0], c=[0,0,0], W=0;
  for(let f=0;f<I.length;f+=3){ const v=[K[I[f]],K[I[f+1]],K[I[f+2]]], X=v.map(i=>[P[3*i],P[3*i+1],P[3*i+2]]), n=cap(cik(X[1],X[0]),cik(X[2],X[0])), w=Math.hypot(n[0],n[1],n[2]);
    for(let j=0;j<3;j++){ const a_=v[j], b_=v[(j+1)%3], k=a_<b_?a_*1048576+b_:b_*1048576+a_; E.set(k,(E.get(k)||0)+1); }
    nr=top3(nr,n); c=top3(c,carp(top3(top3(X[0],X[1]),X[2]),w/3)); W+=w; }
  const L=[]; for(const [k,n] of E) if(n===1){ const a_=Math.floor(k/1048576), b_=k%1048576; L.push(P[3*a_],P[3*a_+1],P[3*a_+2],P[3*b_],P[3*b_+1],P[3*b_+2]); }
  c=carp(c,1/(W||1)); let en=0, d0=1e18; for(let i=0;i<K.length;i++){ const d=(P[3*i]-c[0])**2+(P[3*i+1]-c[1])**2+(P[3*i+2]-c[2])**2; if(d<d0){ d0=d; en=i; } }
  const lb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,lb); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(L),gl.STATIC_DRAW);
  return a._yz={lb,n:L.length/3,m:[P[3*en],P[3*en+1],P[3*en+2]],nr:birim(nr)}; }
function yzKur(){ yzEl.forEach(o=>o.el.remove()); yzEl=[]; urun.parcalar.forEach(q=>{ delete q._dz; }); if(!urun.yi) return; const A_=ag[urun.kod];
  urun.yi.forEach(y=>{ if(y.dz) y.g.forEach((j,b)=>{ urun.parcalar[j]._dz={y,b}; }); });
  urun.yi.forEach(y=>{ const el=document.createElement("div"); el.className="et yzet"; el.hidden=true; el.innerHTML="<b>◆</b><span></span>"; el.children[1].textContent=y.t==="elmas_kesim"?"Elmas kesim":"Yüzey işlemi"; $("etiketler").appendChild(el);
    yzEl.push({el,G:y.g.map(i=>({q:urun.parcalar[i],S:[].concat(urun.parcalar[i].m).map(m=>yzSinir(A_[m]))}))}); }); }
/* ── DESEN KATMANI. yi[].dz = {v: varsayılan desen, vs: varsayılan sıklık, e: etek, d: {kod: {sıklık: {g: [bant başına
   gölgelendirici sayıları], u: [bant başına uygun 1/0], a: açıklama}}}}; yüzey grubu (rl 1) ağında köşe başına (s, t, u) (a.so). "Kesimden
   sonra"da yüzey grubu gizlenmez, desen gölgelendiricide analitik çizilir (normal bozma; kenarda etek). Seçici: küçük resimli desenler
   (SET.dsk), sıklık (İnce/Orta/İri), birden çok bantta "Bantlar: aynı / ayrı". Adres: #urun=…&desen=baklava (ayrıda baklava,verev)&siklik=ince.
   dz yoksa (eski tek demo, desensiz ürün) hiçbir şey değişmez. */
const dsY=()=>urun&&urun.yi?urun.yi.find(y=>y.dz)||null:null;
const dsSik=()=>{ const y=dsY(); return dsSk||(y&&y.dz.vs)||"orta"; };
const dsTaban=()=>{ const y=dsY(); return dsKod||(y&&y.dz.v); };
const dsBantKod=b=>dsAyri&&dsB[b]?dsB[b]:dsTaban();
function dsSifirla(){ dsKod=null; dsSk=null; dsAyri=false; dsB=[]; dsBant=0; }
function dsAdresOku(){ const y=dsY(); if(!y||adresUrun()!==urun.kod) return; const A=adresParca(), k=(A.get("desen")||"").split(",").filter(x=>y.dz.d[x]), sk=A.get("siklik");
  if(sk&&y.dz.d[y.dz.v][sk]){ dsSk=sk; yzKip="sonra"; }
  if(k.length){ yzKip="sonra"; if(k.length>1&&y.g.length>1){ dsAyri=true; dsKod=k[0]; dsB=y.g.map((_,i)=>k[Math.min(i,k.length-1)]); } else { dsAyri=false; dsKod=k[0]; } } }
function dsAdres(){ const y=dsY(); if(GOMULU||!y) return; const a=adresParca(); a.set("urun",urun.kisa||urun.kod);
  if(yzKip==="sonra"){ a.set("desen",dsAyri?y.g.map((_,b)=>dsBantKod(b)).join(","):dsTaban()); a.set("siklik",dsSik()); } else { a.delete("desen"); a.delete("siklik"); }
  try{ history.replaceState(null,"","#"+a.toString().replace(/%3A/g,":").replace(/%2C/g,",")); }catch(e){} }
function dsSec(k){ if(dsAyri) dsB[dsBant]=k; else dsKod=k; yzYaz(); dsAdres(); }
function dsKur(){ const z=$("yz-ds"); z.textContent=""; $("ds-bn").textContent=""; const y=dsY(); if(!y) return;
  (SET.dsk||[]).forEach(x=>{ if(!y.dz.d[x.k]) return; const b=document.createElement("button"); b.type="button"; b.dataset.k=x.k;
    const im=document.createElement("img"); im.alt=""; im.width=56; im.height=40; im.decoding="async"; im.src=x.r; const sp=document.createElement("span"); sp.textContent=x.e;
    b.append(im,sp); b.addEventListener("click",()=>dsSec(x.k)); z.appendChild(b); });
  y.g.forEach((_,i)=>{ const b=document.createElement("button"); b.type="button"; b.dataset.b=i; b.textContent=(i+1)+". bant";
    b.addEventListener("click",()=>{ dsBant=i; dsVurgu=performance.now(); yzYaz(); }); $("ds-bn").appendChild(b); }); }
function dsYaz(){ const y=dsY(), ac=!!y&&yzKip==="sonra"; $("yz-desen").hidden=!ac; if(!ac) return;
  const sk=dsSik(), k=dsAyri?dsBantKod(dsBant):dsTaban(), cok=y.g.length>1;
  for(const b of $("ds-sk").children) b.setAttribute("aria-pressed",b.dataset.s===sk);
  $("ds-bant").hidden=!cok; for(const b of $("ds-ayri").children) b.setAttribute("aria-pressed",(b.dataset.a==="1")===dsAyri);
  $("ds-bn").hidden=!dsAyri; for(const b of $("ds-bn").children) b.setAttribute("aria-pressed",+b.dataset.b===dsBant);
  for(const b of $("yz-ds").children){ const e=y.dz.d[b.dataset.k][sk], uy=dsAyri?e.u[dsBant]:Math.min(...e.u); b.setAttribute("aria-pressed",b.dataset.k===k); b.dataset.uy=uy;
    b.title=uy?"":"Bu gövdeye uygun değil: bant enine yeterince sığmıyor"; }
  const e=y.dz.d[k][sk], uy=dsAyri?e.u[dsBant]:Math.min(...e.u); $("ds-not").textContent=e.a+"."+(uy?"":" Bu gövdeye uygun değil: bant enine yeterince sığmıyor.")+" Gösterimdir; kesim atölyede yapılır."; }
for(const b of $("ds-sk").children) b.addEventListener("click",()=>{ dsSk=b.dataset.s; yzYaz(); dsAdres(); });
for(const b of $("ds-ayri").children) b.addEventListener("click",()=>{ const y=dsY(); if(!y) return; const ay=b.dataset.a==="1"; if(ay===dsAyri) return;
  if(ay){ dsB=y.g.map(()=>dsTaban()); dsBant=0; dsVurgu=performance.now(); } else dsKod=dsBantKod(dsBant); dsAyri=ay; yzYaz(); dsAdres(); });
function yzYaz(){ const Y=urun&&urun.yi; $("v-yuzey").hidden=!Y; for(const b of $("yz-kip").children) b.setAttribute("aria-pressed",b.dataset.c===yzKip);
  dsYaz(); if(!Y) return;
  $("yz-not").textContent=yzKip==="isaret"?[...new Set(Y.map(y=>y.a).filter(Boolean))].join(" "):yzKip==="sonra"?(dsY()?"":"Gösterimdir; kesim atölyede yapılır."):"Dökümden çıktığı hâl: işaretli bölge düz, cilalı ve kesim payı kadar etli."; }
function yzCiz(w,h,R,yk){ const isr=yk==="isaret";
  if(isr){ gl.uniform1f(U.cz,1); gl.uniform4f(U.kn,0,0,0,0); gl.disableVertexAttribArray(1); gl.disableVertexAttribArray(2); gl.vertexAttrib3f(1,0,1,0); gl.vertexAttrib1f(2,1);
    const ox=1.6/w, oy=1.6/h;   // ~0,8 piksel kaydırılmış üç geçiş: çizgi ~2 piksel kalınlıkta (WebGL çizgisi 1 piksel)
    yzEl.forEach(o=>o.G.forEach(g=>{ const q=g.q, M=q._M; if(!M) return; gl.uniformMatrix3fv(U.M,false,new Float32Array([M[0],M[3],M[6],M[1],M[4],M[7],M[2],M[5],M[8]])); gl.uniform3f(U.Tr,q._T[0],q._T[1],q._T[2]);
      g.S.forEach(S_=>{ if(!S_.n) return; gl.bindBuffer(gl.ARRAY_BUFFER,S_.lb); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
        for(const [dx,dy] of [[0,0],[ox,0],[0,oy]]){ gl.uniform3f(U.zo,dx,dy,2.5e-4); gl.drawArrays(gl.LINES,0,S_.n); } }); }));
    gl.uniform3f(U.zo,0,0,0); gl.uniform1f(U.cz,0); gl.enableVertexAttribArray(1); gl.enableVertexAttribArray(2); }
  yzEl.forEach(o=>{ let en=null;   // etiket: kameraya en çok bakan yüzey grubunun orta noktasında
    if(isr) o.G.forEach(g=>{ const q=g.q, S_=g.S[0]; if(!q._M||!S_||!S_.n) return; const z=rd(R,birim(mv(q._M,S_.nr)))[2]; if(!en||z>en.z) en={z,p:top3(mv(q._M,S_.m),q._T)}; });
    const gor=!!en&&en.z>0.08; if(o.el.hidden!==!gor) o.el.hidden=!gor; if(!gor) return;
    const e=ekranaM(en.p), gw=o.el.offsetWidth||90, x=clamp(e[0]+8,4,Math.max(4,cv.clientWidth-gw-4)), y=clamp(e[1]-11,4,Math.max(4,cv.clientHeight-30));
    o.el.style.transform="translate("+x.toFixed(1)+"px,"+y.toFixed(1)+"px)"; }); }
for(const b of $("yz-kip").children) b.addEventListener("click",()=>{ yzKip=b.dataset.c; yzYaz(); dsAdres(); });
/* ── MİNE (u.mn = [{a: bölge adı, k: bölge anahtarı, v: varsayılan renk, p: [mine yüzeyi parça sıraları]}]; parça rl 3 = mine yüzeyi (yuvayı
   dolduran hacmin görünen üstü), mb bölge sırası, dp döküm parçası). Vitrin ve Malzeme'de "Mineli" (açılış) / "Döküm" (yuva boş, metal);
   Montaj ve Teknik döküm hâlini gösterir. Renk bölge başına; birden çok bölgede "Bölgeler: aynı / ayrı". Renk değişince model yeniden kurulmaz.
   Adres: #urun=…&mine=lacivert (bütün bölgeler) ya da mine=zemin:lacivert,simge:bordo (ayrı); Döküm'e dönünce mine adresten kalkar.
   mn yoksa hiçbir şey görünmez ve çizim değişmez. */
const MINE_R=[["lacivert","Lacivert","#1f3290"],["gece_mavisi","Gece mavisi","#16204a"],["turkuaz","Turkuaz","#14aab3"],["acik_mavi","Açık mavi","#72b8ea"],
  ["zumrut","Zümrüt","#0b7d4e"],["cimen","Çimen","#3f9b2c"],["fistik","Fıstık","#a7c45a"],["sari","Sarı","#f3c516"],["turuncu","Turuncu","#ef7718"],
  ["mercan","Mercan","#f06650"],["ates_kirmizisi","Ateş kırmızısı","#d2191c"],["bordo","Bordo","#6d0f24"],["pembe","Pembe","#f08db5"],["eflatun","Eflatun","#b58ad8"],
  ["mor","Mor","#5a2386"],["kahve","Kahve","#6a3f25"],["siyah","Siyah","#121214"],["gri","Gri","#8d9096"],["krem","Krem","#eddcb4"],["beyaz","Beyaz","#f4f2ed"]];
MINE_R.forEach(m=>{ m[3]=[1,3,5].map(i=>Math.pow(parseInt(m[2].substr(i,2),16)/255,2.2)); });   // [anahtar, ad, örnek (sRGB), doğrusal renk]
const MINE_ESA={fildisi:"krem",kirmizi:"ates_kirmizisi",ates:"ates_kirmizisi",yesil:"zumrut",mavi:"lacivert",toprak_yesili:"zumrut"};   // kayıttaki eski/eş adlar (toprak_yesili: Burçlar toprak grubu, motor rengi #3f7d4a; paletteki en yakın Zümrüt, ΔE≈10)
const mnBul=k=>MINE_R.find(m=>m[0]===(MINE_ESA[k]||k))||null;
let mnKip=null, mnR=[], mnAyri=false, mnBolge=0, mnVurgu=-1e9;
const mnGor=()=>!!(urun&&urun.mn&&(mod==="vitrin"||mod==="malzeme")&&mnKip==="mineli");
function mnSifirla(){ const M=urun&&urun.mn; mnKip=M?"mineli":null; mnR=M?M.map(b=>mnBul(b.v)||MINE_R[0]):[]; mnAyri=!!M&&M.length>1&&new Set(mnR).size>1; mnBolge=0; }
function mnAdresOku(){ const M=urun.mn; if(!M||adresUrun()!==urun.kod) return; const s=adresParca().get("mine"); if(!s) return;
  if(s.includes(":")){ s.split(",").forEach(x=>{ const [b,r]=x.split(":"), i=M.findIndex(m=>m.k===b), m=mnBul(r); if(i>=0&&m) mnR[i]=m; }); mnAyri=M.length>1; }
  else { const m=mnBul(s); if(m){ mnR=M.map(()=>m); mnAyri=false; } }
  mnKip="mineli"; }
function mnAdres(){ const M=urun.mn; if(GOMULU||!M) return; const a=adresParca(); a.set("urun",urun.kisa||urun.kod);
  if(mnKip==="mineli") a.set("mine",mnAyri?M.map((b,i)=>b.k+":"+mnR[i][0]).join(","):mnR[0][0]); else a.delete("mine");
  try{ history.replaceState(null,"","#"+a.toString().replace(/%3A/g,":").replace(/%2C/g,",")); }catch(e){} }
function mnKur(){ const z=$("mn-renk"), bn=$("mn-bn"); z.textContent=""; bn.textContent=""; const M=urun.mn; if(!M) return;
  MINE_R.forEach(m=>{ const b=document.createElement("button"); b.type="button"; b.dataset.k=m[0]; b.style.background=m[2]; b.title=m[1]; b.setAttribute("aria-label",m[1]);
    b.addEventListener("click",()=>{ if(mnAyri) mnR[mnBolge]=m; else mnR=M.map(()=>m); mnYaz(); mnAdres(); }); z.appendChild(b); });
  M.forEach((g,i)=>{ const b=document.createElement("button"); b.type="button"; b.dataset.b=i; b.innerHTML='<span class="nokta"></span><span></span>'; b.lastChild.textContent=g.a;
    b.addEventListener("click",()=>{ mnBolge=i; mnVurgu=performance.now(); mnYaz(); }); bn.appendChild(b); }); }
function mnYaz(){ const M=urun&&urun.mn; $("v-mine").hidden=!M; if(!M) return; const ac=mnKip==="mineli", cok=M.length>1;
  for(const b of $("mn-kip").children) b.setAttribute("aria-pressed",b.dataset.c===mnKip);
  $("mn-sec").hidden=!ac; $("mn-bant").hidden=!cok; $("mn-bn").hidden=!(cok&&mnAyri);
  for(const b of $("mn-ayri").children) b.setAttribute("aria-pressed",(b.dataset.a==="1")===mnAyri);
  for(const b of $("mn-bn").children){ const i=+b.dataset.b; b.setAttribute("aria-pressed",i===mnBolge); b.firstChild.style.background=mnR[i][2]; b.title=M[i].a+" · "+mnR[i][1]; }
  const sc=mnR[mnAyri?mnBolge:0]; for(const b of $("mn-renk").children) b.setAttribute("aria-pressed",b.dataset.k===sc[0]);
  $("mn-ad").textContent=(mnAyri?M[mnBolge].a+" · ":"")+sc[1]; }
for(const b of $("mn-kip").children) b.addEventListener("click",()=>{ mnKip=b.dataset.c; mnYaz(); mnAdres(); });
for(const b of $("mn-ayri").children) b.addEventListener("click",()=>{ const M=urun.mn; if(!M) return; const ay=b.dataset.a==="1"; if(ay===mnAyri) return;
  if(ay){ mnBolge=0; mnVurgu=performance.now(); } else mnR=M.map(()=>mnR[mnBolge]); mnAyri=ay; mnYaz(); mnAdres(); });
function montajListe(){ const L=$("liste"), E=$("etiketler"), M_=urun.montaj, kod=urun.kod; L.textContent="";
  M_.forEach((st,i)=>{ const P_=urun.parcalar.filter(q=>q.ms===i), li=document.createElement("li"); li.className="adim"; li.dataset.i=i; li.dataset.acik=0;
    const hazir=P_.length&&P_.every(q=>urun.gruplar[q.g].tur==="hazir"), y=ROZET[st.y];
    li.innerHTML='<span class="no">'+(i+1)+'</span><span class="ad"></span>'+(y?'<span class="tur yontem"></span>':'')+'<span class="tur"></span>';
    li.querySelector(".ad").textContent=st.b+(P_.length>1?" × "+P_.length:""); if(y) li.querySelector(".yontem").textContent=y; li.querySelector(".tur:not(.yontem)").textContent=P_.length?TUR[hazir?"hazir":"dokum"]:"";
    const d=document.createElement("button"); d.textContent="Gizle"; d.setAttribute("aria-pressed","false"); d.id="gz-"+kod+"-a"+i;
    d.addEventListener("click",ev=>{ ev.stopPropagation(); gizliA[i]=!gizliA[i]; d.textContent=gizliA[i]?"Göster":"Gizle"; d.setAttribute("aria-pressed",gizliA[i]); li.dataset.gizli=gizliA[i]?1:0; });
    li.appendChild(d); const a=document.createElement("p"); a.className="tanim ac"; a.textContent=st.a||""; li.appendChild(a);
    li.addEventListener("click",()=>{ if(aktifA===i&&li.dataset.acik==1){ li.dataset.acik=0; aktifA=-1; adimYaz(); return; } aktifAc(i,true); }); L.appendChild(li); });
  L.tabIndex=0; L.setAttribute("aria-label","Montaj adımları: ↑ ↓ ile gez"); }
// telefon: ürün sekmeleri yana kayar; seçili sekme görünür alana gelir, devamı varsa kenar solar
function sekmeIpucu(){ const s=$("sekme"), t=s.scrollWidth-s.clientWidth; s.classList.toggle("devam-sag",t>2&&s.scrollLeft<t-2); s.classList.toggle("devam-sol",t>2&&s.scrollLeft>2); }
function sekmeGoster(){ const s=$("sekme"), u=s.parentElement; u.classList.remove("iki-satir"); if(innerWidth<=900&&s.scrollWidth>1.6*s.clientWidth) u.classList.add("iki-satir");
  const b=s.querySelector('[aria-pressed="true"]'); if(b&&s.scrollWidth>s.clientWidth){ const l=b.getBoundingClientRect().left-s.getBoundingClientRect().left+s.scrollLeft, r=l+b.offsetWidth, pay=28;
    if(l-pay<s.scrollLeft) s.scrollLeft=Math.max(0,l-pay); else if(r+pay>s.scrollLeft+s.clientWidth) s.scrollLeft=r+pay-s.clientWidth; } sekmeIpucu(); }
function modSec(m){ mod=m; app.dataset.mod=m; for(const d of $("modlar").children) d.setAttribute("aria-pressed",d.dataset.mod===m);
  for(const b of document.querySelectorAll("[data-p]")) b.hidden=b.dataset.p!==m;
  if(m!=="montaj"){ oynuyor=false; p=1; if(urun) kamGeri(); } if(urun&&urun.montaj&&m!=="montaj"){ aktifA=-1; for(const li of $("liste").children) li.dataset.acik=0; } if(urun) adimYaz(); sakla("mod",m); }
const basili=new Map(); let onceki=null, sonAn=0;
cv.addEventListener("pointerdown",e=>{ cv.setPointerCapture(e.pointerId); kamH=null; if(MKS.length&&basili.size===0&&p>0.999){ const sc=mekSec(e); if(sc){ MSR={id:e.pointerId,...sc,x:e.clientX,y:e.clientY,t:performance.now()}; basili.set(e.pointerId,[e.clientX,e.clientY]); return; } }
  basili.set(e.pointerId,[e.clientX,e.clientY]); onceki=null; hs=hy=0; sonAn=performance.now(); });
cv.addEventListener("pointermove",e=>{ if(MSR&&MSR.id===e.pointerId){ mekSurukle(e); return; } if(!basili.has(e.pointerId)) return; const es=basili.get(e.pointerId); basili.set(e.pointerId,[e.clientX,e.clientY]); sonDokunus=performance.now();
  if(basili.size===1){ const ds=(e.clientX-es[0])*0.008, dy=(e.clientY-es[1])*0.008, an=performance.now(), dt=Math.max(0.004,(an-sonAn)/1000); sonAn=an;
    sapma+=ds; yunus=clamp(yunus+dy,-3.1,3.1); hs=clamp(hs*0.6+0.4*ds/dt,-5,5); hy=clamp(hy*0.6+0.4*dy/dt,-5,5); }
  else if(basili.size===2){ const [a,b]=[...basili.values()], ara=Math.hypot(a[0]-b[0],a[1]-b[1]), orta=[(a[0]+b[0])/2,(a[1]+b[1])/2]; hs=hy=0;
    if(onceki){ yakin=clamp(yakin*ara/onceki.ara,0.4,8); const k=sonBoy*2.2/yakin/cv.clientHeight; kay[0]+=(orta[0]-onceki.orta[0])*k; kay[1]-=(orta[1]-onceki.orta[1])*k; }
    onceki={ara,orta}; } });
for(const t of ["pointerup","pointercancel"]) cv.addEventListener(t,e=>{ if(MSR&&MSR.id===e.pointerId){ MSR=null; basili.delete(e.pointerId); sonDokunus=performance.now(); return; } basili.delete(e.pointerId); onceki=null; sonDokunus=performance.now(); if(performance.now()-sonAn>90||azHareket) hs=hy=0; });
cv.addEventListener("wheel",e=>{ if(GOMULU) return; e.preventDefault(); yakin=clamp(yakin*Math.exp(-e.deltaY*0.0015),0.4,8); },{passive:false});
cv.addEventListener("dblclick",()=>{ bak(urun.bakis.ilk); yakin=urun.bakis.yakin; });
$("zaman").addEventListener("input",e=>{ oynuyor=false; p=1-e.target.value/1000; if(p<0.999) kamAc(); else kamGeri(); adimYaz(); });
let oynA=1, oynB=1, oynT0=0, oynSure=1.6;   // Parçala / Birleştir: kaydırıcıyı yumuşak eğriyle oynatır
$("oynat").addEventListener("click",()=>{ oynA=p; oynB=(oynuyor?oynB<0.5:p>0.5)?0:1; oynSure=urun.montaj?montajSure():1.6+0.06*sira.length; oynT0=performance.now(); oynuyor=true; if(oynB<0.5) kamAc(); else kamGeri(); adimYaz(); });
$("parcali").addEventListener("click",()=>{ kamAc(); if(urun.montaj){ oynA=p; oynB=0; oynSure=montajSure()*Math.max(0.25,p); oynT0=performance.now(); oynuyor=!azHareket; if(azHareket) p=0; adimYaz(); return; } oynuyor=false; p=0; adimYaz(); });
$("birlesik").addEventListener("click",()=>{ kamGeri(); if(urun.montaj){ oynA=p; oynB=1; oynSure=montajSure()*Math.max(0.25,1-p); oynT0=performance.now(); oynuyor=!azHareket; if(azHareket) p=1; adimYaz(); return; } oynuyor=false; p=1; adimYaz(); });   // montaj adımlı üründe sırayla, tek tek oturarak
$("liste").addEventListener("keydown",e=>{ if(!urun.montaj||(e.key!=="ArrowDown"&&e.key!=="ArrowUp")) return; e.preventDefault(); aktifAc(aktifA<0?0:aktifA+(e.key==="ArrowDown"?1:-1),true); });
$("bag").addEventListener("click",async()=>{ const A_=adresParca(), ek=dsY()&&yzKip==="sonra"&&A_.get("desen")?"#desen="+A_.get("desen")+"&siklik="+dsSik():(urun.mn&&mnKip==="mineli"&&A_.get("mine")?"#mine="+A_.get("mine"):""), a=new URL("../u/"+encodeURIComponent(urun.kisa)+".html",location.href).href+ek, b=$("bag");   // ürünün paylaşım köprüsü (u/<kod>.html); desen seçiliyse u/ sayfası onu set sayfasına geçirir
  let ok=false; try{ await navigator.clipboard.writeText(a); ok=true; }catch(e){ const t=document.createElement("textarea"); t.value=a; document.body.appendChild(t); t.select(); try{ ok=document.execCommand("copy"); }catch(_){} t.remove(); }
  b.textContent=ok?"Kopyalandı":a; b.dataset.adres=a; setTimeout(()=>{ b.textContent="Bağlantıyı kopyala"; },2200); });
$("salla").addEventListener("click",salla); $("cevir").addEventListener("click",()=>{ mekItki(ilkDg); DN.forEach((st,i)=>{ const d=urun.doner[i]; if(d.sin) st.h=st.h===d.sin[1]?d.sin[0]:d.sin[1]; else st.w+=7+3*Math.random(); }); });
$("durdur").addEventListener("click",()=>{ hs=hy=0; FZ.forEach(st=>{ if(st.x) st.xp=st.x.slice(); st.fv=0; }); });
for(const d of document.querySelectorAll("[data-bakis]")) d.addEventListener("click",()=>bak(d.dataset.bakis));
for(const d of $("modlar").children) d.addEventListener("click",()=>modSec(d.dataset.mod));
function ucSec(kap,al,ver){ const yaz=()=>{ for(const k of $(kap).children) k.setAttribute("aria-pressed",k.dataset.c===al()); }; for(const d of $(kap).children) d.addEventListener("click",()=>{ ver(d.dataset.c); yaz(); }); yaz(); return yaz; }
const yazCanli=ucSec("canli",()=>canli,v=>{ canli=v; sakla("canli",v); }), yazGuc=ucSec("guc",()=>guc,v=>{ guc=v; sakla("guc",v); });
const ayar=$("ayar"); $("disli").addEventListener("click",()=>{ if(ayar.showModal) ayar.showModal(); else ayar.setAttribute("open",""); });
$("ayar-kapat").addEventListener("click",()=>ayar.close()); ayar.addEventListener("click",e=>{ if(e.target===ayar) ayar.close(); });
function anahtar(idler,al,ver){ const yaz=()=>idler.forEach(id=>$(id).setAttribute("aria-checked",al())); idler.forEach(id=>$(id).addEventListener("click",()=>{ ver(!al()); yaz(); })); yaz(); return yaz; }
anahtar(["s-kucuk"],()=>kucuk,v=>kucuk=v); anahtar(["s-etiket"],()=>etiket,v=>etiket=v); anahtar(["s-mek"],()=>mekGor,v=>{ mekGor=v; }); anahtar(["s-don"],()=>donIstek,v=>{ donIstek=v; sonDokunus=-1e9; });
const yazFizik=anahtar(["s-fizik"],()=>fizikAcik,v=>fizikAcik=v), yazCekim=anahtar(["s-cekim"],()=>yerCekimi,v=>{ yerCekimi=v; sakla("cekim",v?1:0); });
const oku2=k=>{ try{ return localStorage.getItem("zimba-"+k); }catch(e){ return null; } }, sakla2=(k,v)=>{ if(GOMULU) return; try{ localStorage.setItem("zimba-"+k,v); }catch(e){} };
{ const i=oku2("isik"); if(ISIKLAR[i]) isik=i; const g=oku2("gezinme"); if(!azHareket&&(g==="0"||g==="1")) gezinme=g==="1"; }
const yazIsik=ucSec("isik",()=>isik,v=>{ isik=v; sakla2("isik",v); BK.n=0; BK.imza=""; });
const yazGez=anahtar(["s-gez"],()=>gezinme,v=>{ gezinme=v&&!azHareket; sakla2("gezinme",gezinme?1:0); BK.n=0; BK.imza=""; });
if("IntersectionObserver" in window) new IntersectionObserver(x=>{ gorunur=x.some(y=>y.isIntersecting); }).observe(cv);
$("ayar-sifir").addEventListener("click",()=>{ isik="studyo"; gezinme=!azHareket; yazIsik(); yazGez(); sakla2("isik",""); sakla2("gezinme",""); yerCekimi=true; guc="dogal"; canli="dogal"; fizikAcik=!azHareket; yazCanli(); yazGuc(); yazFizik(); yazCekim(); for(const k of ["cekim","guc","canli"]) sakla(k,""); }); anahtar(["s-kil"],()=>kil,v=>kil=v);
function secenek(kap,liste,sec0,uygula){ liste.forEach((m,i)=>{ const d=document.createElement("button"); d.id=kap+"-"+m[0];
  const r=m[2]; d.innerHTML='<span class="nokta"'+(r?' style="background:rgb('+r.map(x=>Math.round(x*255)).join(",")+')"':"")+'></span><span></span>'; d.lastChild.textContent=m[1];
  d.setAttribute("aria-pressed",i===sec0); d.addEventListener("click",()=>{ uygula(m); for(const k of $(kap).children) k.setAttribute("aria-pressed",k===d); }); $(kap).appendChild(d); }); }
// adres: #urun=<kod> o ürünü açar; #gomulu yalnız sahneyi gösterir (kendiliğinden döner, ayarlar saklanmaz)
const adresParca=()=>new URLSearchParams(location.hash.replace(/^#/,"").replace(/&?gomulu(?=&|$)/,"")), GOMULU=/(^#|&)gomulu(&|$)/.test(location.hash);
const adresUrun=()=>{ const k=adresParca().get("urun"), u=k&&MAN.find(u=>u.kod===k||u.kisa===k); return u?u.kod:null; };   // eski anahtar ya da kısa kod (R-MD-03)
if(GOMULU) app.classList.add("gomulu");
// açılış: model hazır olana ve damga inene kadar durur; dokununca beklemeden geçer
const acilis=$("acilis"), t0=performance.now(); let gec=azHareket;
acilis.addEventListener("pointerdown",()=>{ gec=true; });
function acilisKapat(){ const bekle=gec?0:Math.max(0,1500-(performance.now()-t0)); let bitti=false;
  const kapat=()=>{ if(bitti) return; bitti=true; acilis.classList.add("kapan"); setTimeout(()=>{ acilis.hidden=true; },520); };
  setTimeout(kapat,bekle); acilis.addEventListener("pointerdown",kapat); }
(async()=>{ try{
  gl=cv.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:true}); if(!gl) throw new Error("Bu cihazda 3B görüntü açılamıyor (WebGL yok).");
  const prog=progYap(""); prog_=prog; gl.useProgram(prog);
  for(const k of ["sl","kn","P","R","M","T","Tr","C","tur","kil","Sa","Sb","Sc","Ss","sac","kes","yz","par","gok","yer","bay","bay2","poz","kut","yum","aoD","gez","ys","cz","zo"]) U[k]=gl.getUniformLocation(prog,k);
  gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1); gl.enableVertexAttribArray(2); gl.enable(gl.DEPTH_TEST); dortgenKur(prog);
  secenek("metaller",METAL,0,m=>metal=m); secenek("taslar",TAS,0,m=>{ tas=m; tasSecildi=true; });
  secenek("metaller2",[["ayni","Gövdeyle aynı",null,null]].concat(METAL),0,m=>{ metal2=m[3]?m:null; });
  const veri=await coz();
  for(const u of MAN){ ag[u.kod]=u.aglar.map(a=>agKur(veri,a));
    const d=document.createElement("button"); d.textContent=u.ad.replace(" çifti",""); d.dataset.kod=u.kod; d.id="ur-"+u.kod; d.addEventListener("click",()=>sec(u.kod)); $("sekme").appendChild(d); }
  $("sekme").addEventListener("scroll",sekmeIpucu,{passive:true}); addEventListener("resize",sekmeGoster);
  $("baslik").textContent=SET.ad+" · 3B inceleme"; if(SET.geri&&SET.geri.adres){ const g=$("geri"); g.href=SET.geri.adres; try{ const d=sessionStorage.getItem("zimba-donus"), h=new URL(SET.geri.adres,location.href); if(d&&new URL(d).pathname===h.pathname) g.href=d; }catch(e){} /* ana sayfadan gelindiyse çıkılan süzgeç ve sayfaya dön */ g.textContent=SET.geri.metin||"‹ Geri"; g.hidden=false; } { const c=oku("cekim"), g=oku("guc"), n=oku("canli"); if(c==="0"||c==="1") yerCekimi=c==="1"; if(GUC[g]) guc=g; if(CANLI[n]) canli=n; yazCekim(); yazGuc(); yazCanli(); }
  if(SET.serit){ const e=$("serit"); e.textContent=SET.serit; e.hidden=false; }
  if(SET.notlar&&SET.notlar.length){ const n=$("notlar"); n.hidden=false; for(const t of SET.notlar){ const e=document.createElement("p"); e.textContent=t; n.appendChild(e); } }
  const km=GOMULU?null:oku("mod"); modSec(km&&document.querySelector('[data-p="'+km+'"]')?km:"vitrin");
  const hu=adresUrun(), ku=oku("urun"); sec(hu||(ku&&MAN.some(u=>u.kod===ku)?ku:MAN[0].kod)); requestAnimationFrame(kare);
  if(GOMULU){ acilis.hidden=true; donIstek=true; sonDokunus=-1e9; } else acilisKapat();
  addEventListener("hashchange",()=>{ const k=adresUrun(); if(k&&(!urun||k!==urun.kod)) sec(k); else { if(k&&(urun.rg||urun.top)){ renkKur(); renkCiz(); } if(k&&dsY()){ dsSifirla(); dsAdresOku(); yzYaz(); } if(k&&urun.mn){ mnSifirla(); mnAdresOku(); mnYaz(); } } });
}catch(e){ acilis.hidden=true; durum.hidden=false; durum.textContent=e.message||String(e); } })();

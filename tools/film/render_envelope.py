"""Deterministic native-art envelope animation. No AI-generated lettering.
Render: python tools/film/render_envelope.py --output /tmp/envelope.mp4
Background can be replaced with the last frame of the reviewed door clip.
"""
from pathlib import Path
import argparse, math, subprocess, wave, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT=Path(__file__).resolve().parents[2]
W,H=720,1280
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
GOLD=(220,177,98,255)
def ease(x):
 x=max(0,min(1,x));return x*x*(3-2*x)
def tex(w,h,base,seed=19):
 rng=np.random.default_rng(seed);yy,xx=np.mgrid[:h,:w]
 n=rng.normal(0,1.6,(h,w));light=5*np.sin(xx/w*math.pi)+8*(1-yy/h)
 a=np.stack([np.clip(b+light+n,0,255) for b in base],-1).astype('uint8')
 return Image.fromarray(a).convert('RGBA')
def polytex(texture,pts):
 mask=Image.new('L',texture.size);ImageDraw.Draw(mask).polygon(pts,fill=255)
 im=texture.copy();im.putalpha(mask);d=ImageDraw.Draw(im);d.line(pts+[pts[0]],fill=(194,147,74,220),width=2);return im
def leaf(d,x,y,ang,L=47):
 ux,uy=math.cos(ang),math.sin(ang);vx,vy=-uy,ux
 pts=[]
 for u in np.linspace(0,1,15):
  r=math.sin(math.pi*u)*L*.16;pts.append((x+ux*L*u+vx*r,y+uy*L*u+vy*r))
 for u in np.linspace(1,0,15):
  r=math.sin(math.pi*u)*L*.16;pts.append((x+ux*L*u-vx*r,y+uy*L*u-vy*r))
 d.polygon(pts,fill=(137,94,38,255));d.line(pts+[pts[0]],fill=(236,200,125,255),width=2)
 d.line([(x,y),(x+ux*L*.9,y+uy*L*.9)],fill=(245,220,163,255),width=1)
def branch(d,x,y,sign=1):
 pts=[(x+sign*i*18,y-i*9-i*i*.16) for i in range(12)]
 d.line(pts,fill=(209,164,86,255),width=3)
 for i,(a,b) in enumerate(pts[1:]):
  ang=(-.25 if sign>0 else math.pi+.25)+(0.6 if i%2 else -.65)
  leaf(d,a,b,ang,L=43+i*.7)
def centered(d,text,x,y,size,fill):
 d.text((x,y),text,font=ImageFont.truetype(FONT,size),fill=fill,anchor='mm')
def monogram(im,x,y,size,color=GOLD):
 d=ImageDraw.Draw(im);f=ImageFont.truetype(FONT,size)
 d.text((x-size*.45,y-size*.57),'B',font=f,fill=color)
 d.text((x-size*.05,y-size*.18),'V',font=f,fill=color)
 d.arc((x-size*.6,y-size*.6,x+size*.66,y+size*.72),192,345,fill=color,width=2)
EW,EH=1000,650
back=tex(EW,EH,(14,18,24))
d=ImageDraw.Draw(back);d.rectangle((2,2,997,647),outline=GOLD,width=2)
front=polytex(tex(EW,EH,(18,22,29)),[(0,0),(500,355),(1000,0),(1000,650),(0,650)])
d=ImageDraw.Draw(front);d.line([(0,650),(500,355),(1000,650)],fill=(160,119,62,255),width=2)
branch(d,190,565,-1);branch(d,810,565,1)
flap=polytex(tex(EW,EH,(22,26,32)),[(0,0),(1000,0),(500,355)])
d=ImageDraw.Draw(flap);branch(d,430,210,-1);branch(d,570,210,1)
flapback=polytex(tex(EW,EH,(68,53,33)),[(0,0),(1000,0),(500,355)])
# Seal rendered once; all later motion is rigid transformation.
seal=Image.new('RGBA',(260,260));yy,xx=np.mgrid[:260,:260];r=np.hypot(xx-130,yy-130)
v=35*np.sin((xx+yy)/90)+18*np.cos(r/7)
a=np.zeros((260,260,4),dtype='uint8')
for j,b in enumerate([205,149,65]):a[:,:,j]=np.clip(b+v,0,255)
a[:,:,3]=(r<122)*255;seal=Image.fromarray(a)
d=ImageDraw.Draw(seal);d.ellipse((10,10,250,250),outline=(255,222,155,255),width=5);d.ellipse((26,26,234,234),outline=(103,63,21,255),width=3)
monogram(seal,130,116,110,(80,47,16,255))
CW,CH=870,1050
card=tex(CW,CH,(233,216,186),seed=31);d=ImageDraw.Draw(card)
d.rounded_rectangle((22,22,CW-22,CH-22),radius=4,outline=(155,111,51,255),width=2)
monogram(card,CW/2,300,212,(112,70,29,255))
centered(d,'MANİSA · SALİHLİ',CW/2,532,36,(104,70,36,255))
d.line((220,595,650,595),fill=(157,109,49,255),width=2);d.polygon([(435,584),(444,595),(435,606),(426,595)],fill=(143,89,30,255))
# Stylized mountain/temple illustration in the established gold and ivory palette.
for i in range(5):
 pts=[(x,770+i*24+36*math.sin(x/80+i)) for x in range(45,CW-45,12)]
 d.line(pts,fill=(164+i*6,127+i*5,74+i*5,255),width=2)
d.polygon([(595,785),(802,785),(785,760),(612,760)],outline=(114,78,37,255),fill=(206,182,143,255))
for x in [615,660,705,750]:
 d.rectangle((x,790,x+15,925),fill=(205,180,139,255),outline=(112,78,39,255),width=2)
 d.line((x+4,795,x+4,918),fill=(149,109,55,255),width=1)
d.line((583,930,809,930),fill=(112,78,37,255),width=4)
branch(d,180,960,-1);branch(d,690,960,1)
def warp(im,corners,size=(W,H)):
 # PIL expects inverse perspective transform: output canvas -> artwork coordinates.
 src=[(0,0),(im.width,0),(im.width,im.height),(0,im.height)]
 A=[];B=[]
 for (x,y),(u,v) in zip(corners,src):
  A.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);B.extend([u,v])
 try:coef=np.linalg.solve(np.asarray(A),B)
 except np.linalg.LinAlgError:return Image.new('RGBA',size)
 return im.transform(size,Image.Transform.PERSPECTIVE,coef,Image.Resampling.BICUBIC)
def project_rect(cx,cy,scale,w,h,tilt=0):
 return [(cx+scale*x,cy+scale*y) for x,y in [(-w/2,-h/2),(w/2,-h/2),(w/2,h/2),(-w/2,h/2)]]
def scene(t,bg):
 # The envelope occupies one continuous coordinate system. Opening is a hinge rotation.
 appear=ease(t/1.4);focus=ease((t-1.3)/1.8);unfocus=ease((t-4.2)/1.6)
 scale=(.44+.19*focus-.12*unfocus)*(0.86+.14*appear)
 cx=360;cy=765-30*ease(t/3)+120*ease((t-8)/2)
 opening=ease((t-4.6)/2.1);rise=ease((t-6.2)/2.5)
 image=bg.copy().convert('RGBA')
 layer=Image.new('RGBA',(W,H));corners=project_rect(cx,cy,scale,EW,EH)
 shadow=warp(back,corners).getchannel('A').filter(ImageFilter.GaussianBlur(24));sl=Image.new('RGBA',(W,H),(0,0,0,130));sl.putalpha(shadow.point(lambda a:int(a*.40)));image.alpha_composite(sl)
 layer.alpha_composite(warp(back,corners))
 hinge=cy-scale*EH/2;angle=opening*math.pi
 # Perspective foreshortening about the top edge, with rigid paper surface.
 def flapcorners():
  pts=[]
  for x,y in [(-EW/2,0),(EW/2,0),(EW/2,EH),(-EW/2,EH)]:
   z=y*math.sin(angle);p=1/(1+z/2600)
   pts.append((cx+x*scale*p,hinge+y*math.cos(angle)*scale*p))
  return pts
 if opening>.501:layer.alpha_composite(warp(flapback,flapcorners()))
 # Card starts inside the envelope and slides upward behind the pocket.
 card_y=cy+scale*300-scale*620*rise
 if opening>.18:
  paper=warp(card,project_rect(cx,card_y,scale,CW,CH))
  mask=paper.getchannel('A');ImageDraw.Draw(mask).rectangle((0,int(cy+scale*EH/2),W,H),fill=0);paper.putalpha(mask)
  layer.alpha_composite(paper)
 layer.alpha_composite(warp(front,corners))
 if opening<.499:layer.alpha_composite(warp(flap,flapcorners()))
 if t<6:
  release=ease((t-3.9)/1.3);ss=scale*(1+.18*math.sin(release*math.pi));seal_size=max(1,int(260*ss));stamp=seal.resize((seal_size,seal_size),Image.Resampling.LANCZOS)
  stamp=stamp.rotate(-release*43,resample=Image.Resampling.BICUBIC,expand=True)
  sx=cx+release*155;sy=hinge+355*scale+release*280
  stamp.putalpha(stamp.getchannel('A').point(lambda a:int(a*(1-release))))
  layer.alpha_composite(stamp,(int(sx-stamp.width/2),int(sy-stamp.height/2)))
 layer.putalpha(layer.getchannel('A').point(lambda a:int(a*appear)))
 image.alpha_composite(layer)
 dust=Image.new('RGBA',(W,H));dd=ImageDraw.Draw(dust)
 for i in range(42):
  x=(i*97.31+8*math.sin(t*.3+i))%W;y=(i*61.47-t*(10+i%7))%H
  alpha=int((.5+.5*math.sin(t*1.2+i))*70)
  dd.ellipse((x,y,x+1.5,y+1.5),fill=(255,215,145,alpha))
 image.alpha_composite(dust)
 # Controlled warm dissolve to the exact approved final still.
 final=ease((t-10.5)/1.8)
 if final>0:image=Image.blend(image,FINAL,final)
 return image.convert('RGB')
FINAL=Image.open(ROOT/'assets/scene-10.webp').convert('RGBA').resize((W,H),Image.Resampling.LANCZOS)
def add_sound(source,destination):
 sr=48000;duration=13;tt=np.arange(sr*duration)/sr;rng=np.random.default_rng(41)
 # Sparse metallic notes, soft paper noise and a restrained low resonance.
 audio=np.zeros(len(tt))
 for onset,freq in [(2.4,659.25),(3.9,880),(5.7,987.77),(8.5,1318.51)]:
  x=np.maximum(tt-onset,0);env=(tt>=onset)*np.exp(-x*2.6)*(1-np.exp(-x*70))
  audio+=.05*env*(np.sin(2*np.pi*freq*x)+.25*np.sin(2*np.pi*freq*2.01*x))
 noise=rng.normal(0,1,len(tt));noise=np.convolve(noise,np.ones(28)/28,mode='same')
 audio+=noise*.09*np.exp(-((tt-5.8)/.8)**2)
 audio+=.018*np.sin(2*np.pi*68*tt)*np.exp(-((tt-3.9)/.8)**2)
 audio*=np.minimum(tt/.7,1)*np.minimum((duration-tt)/1.2,1)
 stereo=np.stack([audio,audio*.96],axis=-1);pcm=(np.clip(stereo,-1,1)*32767).astype('<i2')
 with tempfile.NamedTemporaryFile(suffix='.wav') as wav:
  with wave.open(wav.name,'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes(pcm.tobytes())
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-i',wav.name,'-c:v','copy','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',str(destination)],check=True)

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--output',default='/tmp/envelope.mp4');ap.add_argument('--background');ap.add_argument('--preview',action='store_true');args=ap.parse_args()
 bg=Image.open(args.background or ROOT/'assets/scene-05.webp').convert('RGB').resize((W,H),Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(7))
 bg=Image.blend(bg,Image.new('RGB',(W,H),(20,17,14)),.25)
 if args.preview:
  grid=Image.new('RGB',(W*3,H*2))
  for i,t in enumerate([.9,3.0,5.1,6.5,8.4,12.8]):grid.paste(scene(t,bg),(i%3*W,i//3*H))
  grid.resize((1080,1280)).save('/tmp/envelope-preview.jpg');return
 out=Path(args.output);out.parent.mkdir(parents=True,exist_ok=True)
 cmd=['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r','25','-i','-','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',str(out)]
 proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
 for i in range(325):
  proc.stdin.write(scene(i/25,bg).tobytes())
  if i%50==0:print(f'{i}/325 frames',flush=True)
 proc.stdin.close();assert proc.wait()==0
 print(out,flush=True)
if __name__=='__main__':main()

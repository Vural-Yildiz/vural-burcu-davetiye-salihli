from PIL import Image, ImageDraw, ImageFont
import cv2, numpy as np
src='invitation-approved.jpg'
out='invitation-family-final.jpg'
im=cv2.imread(src)
h,w=im.shape[:2]
mask=np.zeros((h,w),np.uint8)
for x1,y1,x2,y2 in [(255,733,438,785),(515,716,720,770)]:
    roi=im[y1:y2,x1:x2]
    gray=cv2.cvtColor(roi,cv2.COLOR_BGR2GRAY)
    m=(gray<150).astype(np.uint8)*255
    m=cv2.dilate(m,np.ones((3,3),np.uint8),iterations=1)
    mask[y1:y2,x1:x2]=m
clean=cv2.inpaint(im,mask,3,cv2.INPAINT_TELEA)
base=Image.fromarray(cv2.cvtColor(clean,cv2.COLOR_BGR2RGB)).convert('RGBA')
font_dir='/usr/share/fonts/truetype/dejavu'
head_font=ImageFont.truetype(font_dir+'/DejaVuSerif.ttf',16)
name_font=ImageFont.truetype(font_dir+'/DejaVuSerif.ttf',19)
head_color=(138,91,43,255)
name_color=(57,47,40,255)
def spaced_text(draw,xy,text,font,fill,spacing=2.0):
    widths=[draw.textlength(ch,font=font) for ch in text]
    total=sum(widths)+spacing*(len(text)-1)
    x,y=xy
    x0=x-total/2
    for ch,cw in zip(text,widths):
        draw.text((x0,y),ch,font=font,fill=fill,anchor='lm')
        x0+=cw+spacing
def block(cx,cy,heading,names,angle=1.6):
    layer=Image.new('RGBA',(360,120),(0,0,0,0))
    d=ImageDraw.Draw(layer)
    spaced_text(d,(180,27),heading,head_font,head_color,2.0)
    d.text((180,60),names,font=name_font,fill=name_color,anchor='mm')
    rot=layer.rotate(angle,resample=Image.Resampling.BICUBIC,expand=True)
    base.alpha_composite(rot,(int(cx-rot.width/2),int(cy-rot.height/2)))
block(340,753,'KÜÇ AİLESİ','Mürüvvet & Ergül')
block(600,740,'YILDIZ AİLESİ','Herdem & Nurettin')
base.convert('RGB').save(out,quality=95,subsampling=0,optimize=True)

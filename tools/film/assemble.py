"""Assemble the reviewed 9-second doorway and 13-second layered envelope.
Usage: python tools/film/assemble.py DOOR_MP4 ENVELOPE_MP4 OUTPUT_MP4
"""
import sys, subprocess, wave, tempfile
from pathlib import Path
import numpy as np

def main():
 door,envelope,output=map(Path,sys.argv[1:4]);sr=48000;duration=22
 tt=np.arange(sr*duration)/sr;rng=np.random.default_rng(72);audio=np.zeros(len(tt))
 # Original quiet ambient score and timed foley, no narration or sampled commercial audio.
 swell=np.sin(np.pi*np.clip(tt/duration,0,1))**2
 for freq,amp in [(130.81,.012),(196,.006),(261.63,.008)]:audio+=amp*np.sin(2*np.pi*freq*tt)*swell
 audio+=.018*np.sin(2*np.pi*57*tt)*np.exp(-((tt-4.8)/1.9)**2)
 noise=rng.normal(0,1,len(tt));noise=np.convolve(noise,np.ones(28)/28,mode='same')
 audio+=noise*.04*np.exp(-((tt-5.4)/1.5)**2)
 audio+=noise*.07*np.exp(-((tt-14.2)/.8)**2)
 for onset,freq in [(10.8,659.25),(12.3,880),(14.1,987.77),(16.9,1318.51)]:
  x=np.maximum(tt-onset,0);env=(tt>=onset)*np.exp(-x*2.6)*(1-np.exp(-x*70))
  audio+=.045*env*(np.sin(2*np.pi*freq*x)+.25*np.sin(2*np.pi*freq*2.01*x))
 audio*=np.minimum(tt/.7,1)*np.minimum((duration-tt)/1.2,1)
 pcm=(np.clip(np.stack([audio,audio*.96],-1),-1,1)*32767).astype('<i2')
 output.parent.mkdir(parents=True,exist_ok=True)
 with tempfile.NamedTemporaryFile(suffix='.wav') as wav:
  with wave.open(wav.name,'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes(pcm.tobytes())
  flt='[0:v]fps=25,scale=720:1280,trim=duration=9,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[a];[1:v]fps=25,trim=duration=13,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[b];[a][b]xfade=transition=fade:duration=0.6:offset=8.4,tpad=stop_mode=clone:stop_duration=0.6[v]'
  cmd=['ffmpeg','-v','error','-y','-i',str(door),'-i',str(envelope),'-i',wav.name,'-filter_complex_threads','1','-filter_complex',flt,'-map','[v]','-map','2:a','-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-t','22','-movflags','+faststart',str(output)]
  subprocess.run(cmd,check=True)
 print(output)
if __name__=='__main__':main()

# Mapa de profundidade (perto = claro) de cada imagem, com Depth-Anything-V2-Small (Apache-2.0), para o parallax 2.5D
import sys, numpy as np, torch
from PIL import Image, ImageFilter
from transformers import AutoImageProcessor, AutoModelForDepthEstimation
M = 'depth-anything/Depth-Anything-V2-Small-hf'
proc = AutoImageProcessor.from_pretrained(M); mod = AutoModelForDepthEstimation.from_pretrained(M).eval()
for n in sys.argv[1:]:
    im = Image.open(f'img/{n}.png').convert('RGB')
    with torch.no_grad(): out = mod(**proc(images=im, return_tensors='pt')).predicted_depth
    d = torch.nn.functional.interpolate(out[None], size=im.size[::-1], mode='bicubic', align_corners=False)[0, 0].numpy()
    d = (d - d.min()) / (d.max() - d.min() + 1e-9)
    Image.fromarray((d * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(3)).save(f'prof/{n}.png'); print(n, im.size)

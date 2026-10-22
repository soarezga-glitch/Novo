"""Vídeo "1 Coríntios 13" — mão desenhando + aquarela, com câmera e transições.

uso: python3 -I render.py SEG_INICIO SEG_FIM   (renderiza os segmentos [ini, fim) em clips/seg_XX.mp4)
"""
import cv2, numpy as np, subprocess, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS, CELL = 1920, 1080, 30, 16
TR = 0.5  # duração das transições
AUDIO_END = 545.776

# ---------------------------------------------------------------- roteiro
# comp: imagem com vários elementos (caixa x0,y0,x1,y1 + hora em que a mão começa)
# full: imagem de tela cheia (start = onde a mão começa; kb = movimento de câmera depois)
# still: imagem já pintada reaproveitada (cam = (cx,cy,zoom) inicial e final)
SEGS = [
    dict(img='01', t0=0.0, kind='comp', els=[((34, 174, 560, 934), 0.3), ((617, 168, 1305, 941), 6.02), ((1344, 273, 1920, 836), 13.28)]),
    dict(img='02', t0=17.76, kind='comp', els=[((0, 180, 725, 890), 17.9), ((755, 180, 1320, 890), 24.18), ((1383, 180, 1900, 890), 30.62)]),
    dict(img='03', t0=48.62, kind='full', start=(1050, 300), kb=('in', 1000, 330)),
    dict(img='04', t0=57.48, kind='full', start=(560, 260), kb=('pan', 1500, 300)),
    dict(img='05', t0=76.12, kind='full', start=(620, 300), kb=('in', 900, 400)),
    dict(img='06', t0=90.0, kind='comp', els=[((0, 110, 590, 980), 90.2), ((610, 110, 1315, 980), 99.3), ((1360, 110, 1900, 980), 104.2)]),
    dict(img='07', t0=109.3, kind='full', start=(1100, 200), kb=('in', 1150, 330)),
    dict(img='08', t0=127.74, kind='comp', els=[((0, 109, 640, 985), 128.0), ((665, 109, 1275, 985), 134.1), ((1305, 109, 1900, 985), 143.62)]),
    dict(img='09', t0=150.3, kind='comp', els=[((15, 128, 640, 965), 150.5), ((660, 128, 1205, 965), 154.76), ((1235, 128, 1900, 965), 157.3)]),
    dict(img='10', t0=162.02, kind='comp', els=[((28, 78, 914, 1031), 162.3), ((1046, 56, 1897, 1024), 174.28)]),
    dict(img='11', t0=177.58, kind='comp', els=[((0, 82, 917, 973), 177.8), ((1052, 75, 1920, 979), 185.4)]),
    dict(img='12', t0=187.02, kind='comp', els=[((0, 113, 635, 960), 187.3), ((660, 113, 1240, 960), 194.66), ((1290, 113, 1900, 960), 199.78)]),
    dict(img='13', t0=202.82, kind='comp', els=[((0, 100, 635, 970), 203.1), ((650, 100, 1270, 970), 220.28), ((1295, 100, 1900, 970), 228.4)]),
    dict(img='14', t0=235.04, kind='full', start=(560, 250), kb=('in', 900, 330)),
    dict(img='15', t0=250.38, kind='full', start=(700, 250), kb=('pan', 1300, 400)),
    dict(img='29', t0=258.78, kind='comp', els=[((0, 225, 440, 895), 259.0), ((470, 300, 1055, 710), 261.48), ((1070, 240, 1450, 760), 263.0), ((1495, 240, 1900, 740), 264.6)]),
    dict(img='16', t0=267.78, kind='comp', els=[((15, 160, 460, 900), 267.9), ((490, 160, 940, 900), 272.2), ((980, 160, 1420, 900), 273.2), ((1455, 160, 1900, 900), 274.24)]),
    dict(img='17', t0=276.6, kind='full', start=(760, 300), kb=('in', 760, 380)),
    dict(img='18', t0=301.2, kind='comp', els=[((0, 75, 930, 982), 301.4), ((1006, 78, 1895, 984), 312.4)]),
    dict(img='19', t0=316.8, kind='comp', els=[((620, 436, 1310, 1000), 317.0), ((20, 205, 645, 920), 321.56), ((665, 0, 1320, 460), 323.54), ((1297, 320, 1900, 1000), 325.08)]),
    dict(img='20', t0=343.2, kind='comp', els=[((31, 120, 925, 941), 343.4), ((996, 111, 1892, 953), 353.92)]),
    dict(img='21', t0=360.12, kind='full', start=(1250, 450), kb=('in', 1250, 500)),
    dict(img='22', t0=379.84, kind='full', start=(860, 330), kb=('in', 860, 500)),
    dict(img='23', t0=385.52, kind='comp', els=[((25, 205, 575, 960), 385.7), ((620, 250, 1135, 960), 388.3), ((1105, 55, 1910, 985), 390.0)],
         focus=[(396.36, 0), (405.94, 1), (410.7, 2)]),
    dict(img='24', t0=415.38, kind='comp', els=[((0, 165, 625, 945), 415.6), ((660, 150, 1255, 965), 423.24), ((1295, 115, 1900, 975), 442.48)]),
    dict(img='25', t0=449.24, kind='full', start=(680, 200), kb=('pan', 1200, 400)),
    dict(img='26', t0=469.76, kind='comp', els=[((0, 60, 625, 1000), 470.0), ((640, 60, 1270, 1000), 476.3), ((1280, 55, 1910, 1010), 478.6)]),
    dict(img='27', t0=490.1, kind='full', start=(660, 330), kb=('in', 900, 450)),
    dict(img='07', t0=498.5, kind='still', cam=((1100, 450, 1.0), (1120, 330, 1.25)), tr='fade'),
    dict(img='16', t0=501.1, kind='still', cam=((1200, 530, 1.9), (1200, 530, 2.1)), tr='slide'),
    dict(img='18', t0=502.6, kind='still', cam=((465, 530, 1.4), (465, 530, 1.55)), tr='slide'),
    dict(img='13', t0=504.0, kind='still', cam=((1600, 535, 1.6), (1600, 535, 1.75)), tr='slide'),
    dict(img='18', t0=505.44, kind='still', cam=((1450, 530, 1.4), (1450, 530, 1.65)), tr='slide'),
    dict(img='19', t0=508.2, kind='still', cam=((965, 700, 1.5), (965, 700, 1.8)), tr='zoom'),
    dict(img='22', t0=510.4, kind='still', cam=((960, 540, 1.0), (860, 450, 1.2)), tr='fade'),
    dict(img='28', t0=514.68, kind='full', start=(800, 330), kb=('pan', 1100, 450)),
    dict(img='29', t0=538.58, kind='still', cam=((960, 540, 1.0), (760, 505, 1.35)), tr='zoom'),
    dict(img='28', t0=540.88, kind='still', cam=((1000, 480, 1.2), (960, 540, 1.0)), tr='fade', fadeout=1.5),
]
for i, s in enumerate(SEGS):
    s['t1'] = SEGS[i + 1]['t0'] if i + 1 < len(SEGS) else AUDIO_END
TRS = ['slide', 'wipe', 'zoom', 'fade']

# ---------------------------------------------------------------- utilidades
ease = lambda x: x * x * (3 - 2 * x)
def sstep(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)

def sketch_of(color, paper):
    g = cv2.cvtColor(cv2.medianBlur(color, 3), cv2.COLOR_BGR2GRAY)
    g = cv2.createCLAHE(2.0, (8, 8)).apply(g).astype(np.float32)
    dodge = np.clip(g / (cv2.GaussianBlur(g, (0, 0), 8) + 1) * 255, 0, 255)
    sk = np.clip((dodge - 155) / 100, 0, 1) ** 1.6
    sk = cv2.GaussianBlur(sk, (0, 0), 0.6); sk[sk > 0.9] = 1
    ink = np.array([40, 45, 55], np.float32)
    return (sk[..., None] * paper + (1 - sk[..., None]) * ink).astype(np.float32), sk

def nn_order(cells, start):
    pts = np.array(cells, np.float32); left = np.ones(len(pts), bool)
    cur = np.array(start, np.float32); order = []
    for _ in range(len(pts)):
        d = np.abs(pts[:, 0] - cur[0]) + np.abs(pts[:, 1] - cur[1]); d[~left] = 1e9
        i = int(np.argmin(d)); order.append(cells[i]); left[i] = False; cur = pts[i]
    return order

FREE = False  # True: câmera pode passar da borda (imagens com fundo de papel)
def clamp_cam(cx, cy, z):
    z = max(1.0, z); hw, hh = W / (2 * z), H / (2 * z)
    if FREE: return cx, cy, z
    return min(max(cx, hw), W - hw), min(max(cy, hh), H - hh), z

def warp(img, cam):
    cx, cy, z = clamp_cam(*cam)
    if abs(z - 1) < 1e-4: return img
    M = np.float32([[z, 0, W / 2 - cx * z], [0, z, H / 2 - cy * z]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

def to_screen(p, cam):
    cx, cy, z = clamp_cam(*cam)
    return np.array([(p[0] - cx) * z + W / 2, (p[1] - cy) * z + H / 2])

class CamPath:
    """lista de (tempo, cx, cy, z, duração da ida)"""
    def __init__(self, keys): self.keys = keys
    def __call__(self, t):
        cur = np.array(self.keys[0][1:4], float)
        for (tk, cx, cy, z, d) in self.keys:
            if t < tk: break
            tgt = np.array([cx, cy, z], float)
            a = ease(min(1, (t - tk) / d)) if d > 0 else 1
            cur = cur + (tgt - cur) * a
        return tuple(cur)

def el_cam(box):
    x0, y0, x1, y1 = box
    z = min(1.8, max(1.0, 0.92 * min(W / (x1 - x0), H / (y1 - y0))))
    return (x0 + x1) / 2, (y0 + y1) / 2, z

# ---------------------------------------------------------------- mão
hand = cv2.imread(os.path.join(HERE, 'mao.png'), cv2.IMREAD_UNCHANGED)
a = hand[..., 3].astype(np.float32)
ys, xs = np.where(a > 128); tip_x, tip_y = xs[np.argmax(ys)], ys.max()
FADE = int(hand.shape[1] * 0.08)
right = np.where(a.max(axis=0) > 128)[0].max()
ramp = np.ones(hand.shape[1], np.float32); ramp[right - FADE:right + 1] = np.linspace(1, 0, FADE + 1)
hand[..., 3] = (a * ramp[None, :]).astype(np.uint8)
HS = 0.52
hand = cv2.resize(hand, None, fx=HS, fy=HS, interpolation=cv2.INTER_AREA)
TIP = np.array([tip_x * HS, tip_y * HS])
h_rgb = hand[..., :3].astype(np.float32); h_a = hand[..., 3:].astype(np.float32) / 255
sh_a = cv2.GaussianBlur(hand[..., 3], (0, 0), 14).astype(np.float32)[..., None] / 255 * 0.28
OFF = np.array([W + 380.0, H + 260.0])

def blend(dst, src, al, x, y):
    hh, ww = al.shape[:2]
    x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + ww, W), min(y + hh, H)
    if x1 <= x0 or y1 <= y0: return
    sx0, sy0 = x0 - x, y0 - y
    sa = al[sy0:sy0 + y1 - y0, sx0:sx0 + x1 - x0]
    s = src if np.isscalar(src) else src[sy0:sy0 + y1 - y0, sx0:sx0 + x1 - x0]
    dst[y0:y1, x0:x1] = dst[y0:y1, x0:x1] * (1 - sa) + s * sa

def draw_hand(f, p):
    x, y = int(p[0] - TIP[0]), int(p[1] - TIP[1])
    blend(f, 0.0, sh_a, x + 22, y + 26); blend(f, h_rgb, h_a, x, y)

# ---------------------------------------------------------------- segmento
class Seg:
    def __init__(self, idx):
        s = SEGS[idx]; self.s = s; self.idx = idx
        self.t0, self.t1, self.kind = s['t0'], s['t1'], s['kind']
        color = cv2.resize(cv2.imread(os.path.join(HERE, 'imagens', s['img'] + '.png')), (W, H), interpolation=cv2.INTER_CUBIC)
        self.color = color.astype(np.float32)
        if self.kind == 'still':
            c0, c1 = s['cam']
            self.cam = lambda t: tuple(np.array(c0) + (np.array(c1) - np.array(c0)) * ease(np.clip((t - self.t0) / (self.t1 - self.t0), 0, 1)))
            self.windows = []
            return
        border = np.concatenate([color[:30].reshape(-1, 3), color[-30:].reshape(-1, 3), color[:, :30].reshape(-1, 3), color[:, -30:].reshape(-1, 3)])
        paper = np.median(border, 0).astype(np.float32) if self.kind == 'comp' else np.array([234, 244, 250], np.float32)
        if paper.mean() < 200: paper = np.array([234, 244, 250], np.float32)
        rng = np.random.default_rng(7)
        noise = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 1.2) * 2.5
        self.paper = np.clip(paper + noise[..., None], 0, 255).astype(np.float32)
        self.sketch, sk = sketch_of(color, self.paper)
        ink = sk < 0.78
        gh, gw = H // CELL + 1, W // CELL + 1
        cell_ink = np.zeros((gh, gw), bool)
        for cy in range(gh):
            for cx in range(gw):
                cell_ink[cy, cx] = ink[cy * CELL:(cy + 1) * CELL, cx * CELL:(cx + 1) * CELL].any()
        dt = np.full((gh, gw), np.inf, np.float32)   # hora em que cada célula é desenhada
        ct = np.full((H, W), np.inf, np.float32)     # hora em que cada pixel ganha cor
        self.windows = []                            # (início, fim, lista de células, tempos)
        if self.kind == 'comp':
            els = s['els']; owner = -np.ones((gh, gw), int)
            for k, (box, _) in enumerate(els):
                x0, y0, x1, y1 = box
                sub = owner[y0 // CELL:(y1 - 1) // CELL + 1, x0 // CELL:(x1 - 1) // CELL + 1]; sub[sub < 0] = k
            keys = []
            for k, (box, ts) in enumerate(els):
                nxt = els[k + 1][1] if k + 1 < len(els) else self.t1
                avail = nxt - ts
                dd = float(np.clip(avail * 0.55, 0.8, 6.0)); cd = float(np.clip(avail * 0.25, 0.5, 1.6))
                cells = [(cx, cy) for cy in range(gh) for cx in range(gw) if owner[cy, cx] == k and cell_ink[cy, cx]]
                x0, y0, x1, y1 = box
                order = nn_order(cells, (((x0 + x1) / 2) // CELL, (y0 + (y1 - y0) * 0.3) // CELL))
                times = ts + np.arange(len(order)) / max(1, len(order)) * dd
                for (cx, cy), tt in zip(order, times): dt[cy, cx] = tt
                blank = (owner == k) & ~cell_ink; dt[blank] = ts
                self.windows.append((ts, ts + dd, order, times))
                # cor espalhando do centro do elemento
                yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
                dist = np.sqrt(((xx - (x0 + x1) / 2) / (x1 - x0)) ** 2 + ((yy - (y0 + y1) / 2) / (y1 - y0)) ** 2)
                blob = cv2.GaussianBlur(rng.random(dist.shape).astype(np.float32), (0, 0), 25)
                f = dist / dist.max() * 0.75 + (blob - blob.min()) / (np.ptp(blob) + 1e-6) * 0.25
                region = ct[y0:y1, x0:x1]
                upd = np.isinf(region)
                region[upd] = (ts + dd + f * cd)[upd]
                keys.append((ts - 0.35 if k else self.t0 - 1, *el_cam(box), 0.8 if k else 0))
                self.last_done = ts + dd + cd
            ct[np.isinf(ct)] = self.last_done
            for (tf, k) in s.get('focus', []):
                keys.append((tf, *el_cam(els[k][0]), 0.9))
            if 'focus' not in s and self.t1 - self.last_done > 2.6:
                keys.append((self.last_done + 1.0, W / 2, H / 2, 1.0, 1.1))
            self.cam = CamPath(keys)
        else:
            D = self.t1 - self.t0
            dd = float(np.clip(D * 0.38, 2.5, 7.0)); cd = float(np.clip(D * 0.15, 1.2, 2.2))
            ts = self.t0 + 0.35
            cells = [(cx, cy) for cy in range(gh) for cx in range(gw) if cell_ink[cy, cx]]
            sx, sy = s['start']
            order = nn_order(cells, (sx // CELL, sy // CELL))
            times = ts + np.arange(len(order)) / len(order) * dd
            for (cx, cy), tt in zip(order, times): dt[cy, cx] = tt
            dt[~cell_ink] = ts
            self.windows.append((ts, ts + dd, order, times))
            yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
            dist = np.sqrt(((xx - sx) / W) ** 2 + ((yy - sy) / H) ** 2)
            blob = cv2.GaussianBlur(rng.random((H, W)).astype(np.float32), (0, 0), 40)
            f = dist / dist.max() * 0.7 + (blob - blob.min()) / np.ptp(blob) * 0.3
            ct[:] = ts + dd + f * cd
            self.last_done = ts + dd + cd
            mode, kx, ky = s['kb']
            if mode == 'in':
                keys = [(self.t0 - 1, W / 2, H / 2, 1.0, 0), (self.last_done, kx, ky, 1.18, max(1.0, self.t1 - self.last_done))]
            else:
                keys = [(self.t0 - 1, W / 2, H / 2, 1.0, 0), (self.last_done - 0.5, W * 0.38, ky, 1.14, 1.2),
                        (self.last_done + 0.7, kx, ky, 1.14, max(1.0, self.t1 - self.last_done - 0.7))]
            self.cam = CamPath(keys)
        self.dt_full = cv2.resize(dt, (gw * CELL, gh * CELL), interpolation=cv2.INTER_NEAREST)[:H, :W]
        self.ct = ct

    def image_at(self, t):
        if self.kind == 'still' or t >= self.last_done + 0.4: return self.color
        drawn = (self.dt_full <= t)[..., None]
        base = np.where(drawn, self.sketch, self.paper)
        al = sstep((t - self.ct) / 0.35)[..., None]
        return base * (1 - al) + self.color * al

    def tip_target(self, t):
        """posição da ponta do lápis na imagem, ou None se a mão deve sair"""
        for (a, b, order, times) in self.windows:
            if a <= t <= b and order:
                i = min(len(order) - 1, int(np.searchsorted(times, t)))
                cx, cy = order[i]; return np.array([cx * CELL + 8, cy * CELL + 8], float), True
            if a - 0.55 <= t < a and order:
                cx, cy = order[0]; return np.array([cx * CELL + 8, cy * CELL + 8], float), False
        for k, (a, b, order, times) in enumerate(self.windows):
            if b < t and k + 1 < len(self.windows) and self.windows[k + 1][0] - b < 1.4 and t < self.windows[k + 1][0]:
                cx, cy = order[-1]; return np.array([cx * CELL + 8, cy * CELL + 8], float), False
        return None, False

    def final_frame(self):
        img = self.color
        f = warp(img, self.cam(self.t1 - 1e-3))
        return f

# ---------------------------------------------------------------- transições
def transition(prev, new, p, kind):
    p = ease(p)
    if kind == 'fade': return prev * (1 - p) + new * p
    if kind == 'slide':
        dx = int(p * W); out = np.empty_like(new)
        out[:, :W - dx] = prev[:, dx:]; out[:, W - dx:] = new[:, :dx]
        return out
    if kind == 'zoom':
        z = 1 + 0.35 * p
        M = np.float32([[z, 0, W / 2 - W / 2 * z], [0, z, H / 2 - H / 2 * z]])
        big = cv2.warpAffine(prev, M, (W, H), borderMode=cv2.BORDER_REFLECT)
        return big * (1 - p) + new * p
    if kind == 'wipe':
        x = np.linspace(0, 1, W, dtype=np.float32)[None, :]
        n = WIPE_NOISE
        m = sstep((p * 1.4 - (x * 0.8 + n * 0.2)) / 0.2)[..., None]
        return prev * (1 - m) + new * m
    return new
WIPE_NOISE = cv2.GaussianBlur(np.random.default_rng(3).random((H, W)).astype(np.float32), (0, 0), 30)
WIPE_NOISE = (WIPE_NOISE - WIPE_NOISE.min()) / np.ptp(WIPE_NOISE)

# ---------------------------------------------------------------- render
def render(idx, out):
    global FREE
    free = lambda i: SEGS[i]['kind'] == 'comp' or SEGS[i]['img'] in ('29', '16', '19', '13', '18')
    prev = None
    if idx > 0:
        FREE = free(idx - 1); prev = Seg(idx - 1).final_frame().astype(np.float32)
    FREE = free(idx)
    seg = Seg(idx)
    tr_kind = seg.s.get('tr', TRS[idx % len(TRS)])
    tr_len = 0.3 if seg.kind == 'still' and tr_kind == 'slide' else TR
    f0, f1 = round(seg.t0 * FPS), round(seg.t1 * FPS)
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}',
                           '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
                           '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    hp = OFF.copy(); rng = np.random.default_rng(idx)
    for fi in range(f0, f1):
        t = fi / FPS
        cam = seg.cam(t)
        frame = warp(seg.image_at(t), cam).astype(np.float32)
        if seg.kind != 'still':
            tgt, drawing = seg.tip_target(t)
            if tgt is not None:
                sp = to_screen(tgt, cam)
                if drawing: sp = sp + rng.normal(0, 3, 2); hp = hp * 0.35 + sp * 0.65
                else: hp = hp + (sp - hp) * 0.22
            else:
                hp = hp + (OFF - hp) * 0.12
            if hp[0] < W + 300 and hp[1] < H + 200: draw_hand(frame, hp)
        if prev is not None and t - seg.t0 < tr_len:
            frame = transition(prev, frame, (t - seg.t0) / tr_len, tr_kind)
        fo = seg.s.get('fadeout')
        if fo and t > seg.t1 - fo:
            k = (t - (seg.t1 - fo)) / fo; frame = frame * (1 - k) + np.array([234, 244, 250], np.float32) * k
        ff.stdin.write(np.clip(frame, 0, 255).astype(np.uint8).tobytes())
    ff.stdin.close(); ff.wait()
    print(f'{out}: {(f1 - f0) / FPS:.2f}s', flush=True)

if __name__ == '__main__':
    a, b = int(sys.argv[1]), int(sys.argv[2])
    os.makedirs(os.path.join(HERE, 'clips'), exist_ok=True)
    for i in range(a, b):
        render(i, os.path.join(HERE, 'clips', f'seg_{i:02d}.mp4'))

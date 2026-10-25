"""Whiteboard / watercolor hand-drawing animation for ONE image, panel by panel.

usage: python3 -I whiteboard.py IMAGE HAND OUT.mp4 DURATION [--seg X0:X1:T0 ...] [--zoom 1.06]

Each --seg is a vertical strip of the image (x in 1920 space) that starts
being drawn at T0 seconds into the clip. Without --seg the whole image is
one segment starting at 0. After everything is colored the image holds
with a slow push-in (--zoom) until DURATION.
"""
import cv2, numpy as np, subprocess, argparse

ap = argparse.ArgumentParser()
ap.add_argument('image'); ap.add_argument('hand'); ap.add_argument('out')
ap.add_argument('duration', type=float)
ap.add_argument('--seg', action='append', default=[])
ap.add_argument('--zoom', type=float, default=1.05)
ap.add_argument('--fast', action='store_true', help='short sketch/color times (text cards)')
ap.add_argument('--focus', default=None, help='X,Y the slow push-in drifts toward')
ap.add_argument('--panzoom', type=float, default=1.12, help='zoom on the panel being drawn')
ap.add_argument('--nofade', action='store_true')
args = ap.parse_args()

W, H, FPS, CELL = 1920, 1080, 30, 16
D = args.duration
rng = np.random.default_rng(7)

color = cv2.resize(cv2.imread(args.image), (W, H), interpolation=cv2.INTER_CUBIC)
g = cv2.cvtColor(color, cv2.COLOR_BGR2GRAY).astype(np.float32)
dodge = np.clip(g / (cv2.GaussianBlur(g, (0, 0), 8) + 1) * 255, 0, 255)
sk = np.clip((dodge - 150) / 105, 0, 1) ** 1.6
sk[g < 80] = 0
sk[sk > 0.9] = 1.0
PAPER = np.array([234, 244, 250], np.float32)
INK = np.array([40, 45, 55], np.float32)
noise = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 1.2) * 2.5
paper_img = np.clip(PAPER + noise[..., None], 0, 255)
sketch = sk[..., None] * paper_img + (1 - sk[..., None]) * INK
colf = color.astype(np.float32)

segs = []
for s in args.seg:
    x0, x1, t0 = s.split(':'); segs.append((int(x0), int(x1), float(t0)))
if not segs: segs = [(0, W, 0.0)]
segs.sort(key=lambda s: s[2])

inkmask = sk < 0.78
def seg_cells(x0, x1):
    cells = []
    for cy in range(H // CELL + 1):
        for cx in range(x0 // CELL, min(x1, W) // CELL + 1):
            y0, xx = cy * CELL, cx * CELL
            if xx < x0 or xx >= x1: continue
            if inkmask[y0:y0 + CELL, xx:xx + CELL].any(): cells.append((cx, cy))
    return cells

def nn_order(cells, start):
    if not cells: return cells
    pts = np.array(cells, np.float32); left = np.ones(len(pts), bool)
    cur = np.array(start, np.float32); order = []
    for _ in range(len(pts)):
        d = np.abs(pts[:, 0] - cur[0]) + np.abs(pts[:, 1] - cur[1]); d[~left] = 1e9
        i = int(np.argmin(d)); order.append(cells[i]); left[i] = False; cur = pts[i]
    return order

hand = cv2.imread(args.hand, cv2.IMREAD_UNCHANGED)
if hand.shape[2] == 3:
    hand = np.dstack([hand, np.full(hand.shape[:2], 255, np.uint8)])
a = hand[..., 3].astype(np.float32)
ys, xs = np.where(a > 128)
# pencil tip = the bottom-left extreme of the hand image
i_tip = int(np.argmax(ys - xs)); tip_x, tip_y = xs[i_tip], ys[i_tip]
FADE = int(hand.shape[1] * 0.22)
right = np.where(a.max(axis=0) > 128)[0].max()
ramp = np.ones(hand.shape[1], np.float32)
ramp[right - FADE:right + 1] = np.linspace(1, 0, FADE + 1) ** 1.5
a *= ramp[None, :]
hand[..., 3] = a.astype(np.uint8)
S = 0.58 * 1536 / hand.shape[1]
hand = cv2.resize(hand, None, fx=S, fy=S, interpolation=cv2.INTER_AREA)
TIP = np.array([tip_x * S, tip_y * S])
h_rgb = hand[..., :3].astype(np.float32)
h_a = hand[..., 3:].astype(np.float32) / 255
sh_a = cv2.GaussianBlur(hand[..., 3], (0, 0), 14).astype(np.float32)[..., None] / 255 * 0.28

def blend(dst, src, al, x, y):
    hh, ww = al.shape[:2]
    x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + ww, W), min(y + hh, H)
    if x1 <= x0 or y1 <= y0: return
    sx0, sy0 = x0 - x, y0 - y
    sa = al[sy0:sy0 + y1 - y0, sx0:sx0 + x1 - x0]
    s = src if np.isscalar(src) else src[sy0:sy0 + y1 - y0, sx0:sx0 + x1 - x0]
    dst[y0:y1, x0:x1] = dst[y0:y1, x0:x1] * (1 - sa) + s * sa

def draw_hand(f, p):
    if p is None: return
    x, y = int(p[0] - TIP[0]), int(p[1] - TIP[1])
    blend(f, 0.0, sh_a, x + 22, y + 26); blend(f, h_rgb, h_a, x, y)

ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24',
                       '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium',
                       '-crf', '18', '-pix_fmt', 'yuv420p', args.out], stdin=subprocess.PIPE)
nframes = 0
TOTAL = int(round(D * FPS))
FX, FY = [float(v) for v in args.focus.split(',')] if args.focus else (W / 2, H / 2)
# camera: mode 'panel' frames one panel, mode 'push' slowly pushes in over the whole clip
cam = np.array([W / 2, H / 2, 1.0]); cam_mode = ['push']; cam_panel = [W / 2]
def cam_goal():
    if cam_mode[0] == 'panel':
        return np.array([cam_panel[0], H / 2, args.panzoom])
    p = nframes / max(1, TOTAL)
    z = 1 + (args.zoom - 1) * p
    return np.array([W / 2 + (FX - W / 2) * p, H / 2 + (FY - H / 2) * p, z])
def emit(f):
    global nframes, cam
    g = cam_goal(); cam = cam + (g - cam) * (0.035 if cam_mode[0] == 'panel' else 0.08)
    cx, cy, z = cam
    hw, hh = W / (2 * z), H / (2 * z)
    cx = min(max(cx, hw), W - hw); cy = min(max(cy, hh), H - hh)
    M = np.float32([[z, 0, W / 2 - z * cx], [0, z, H / 2 - z * cy]])
    f = cv2.warpAffine(np.clip(f, 0, 255).astype(np.uint8), M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    left = TOTAL - nframes
    if not args.nofade and left <= 14:
        k = (14 - left) / 14
        pz = cv2.warpAffine(paper_img.astype(np.uint8), M, (W, H), borderMode=cv2.BORDER_REFLECT)
        f = cv2.addWeighted(f, 1 - k, pz, k, 0)
    nframes += 1
    ff.stdin.write(f.tobytes())

canvas = paper_img.copy()
OFF = np.array([W + 300.0, H + 200.0]); tip = None
ease = lambda t: t * t * (3 - 2 * t)

def hold_until(t):
    while nframes < int(round(t * FPS)):
        f = canvas.copy(); draw_hand(f, tip); emit(f)

def move_hand(target, frames):
    global tip
    st = OFF.copy() if tip is None else tip.copy()
    for i in range(frames):
        f = canvas.copy(); draw_hand(f, st + (np.array(target, float) - st) * ease((i + 1) / frames)); emit(f)
    tip = np.array(target, float)

def draw_cells(cells, seconds):
    global tip
    n = max(1, int(seconds * FPS)); per = len(cells) / n; k = 0
    for i in range(n):
        ke = int(round((i + 1) * per))
        for (cx, cy) in cells[k:ke]:
            y0, x0 = cy * CELL, cx * CELL
            canvas[y0:y0 + CELL, x0:x0 + CELL] = sketch[y0:y0 + CELL, x0:x0 + CELL]
        if ke > k:
            cx, cy = cells[ke - 1]
            tip = tip * 0.35 + (np.array([cx * CELL + 8, cy * CELL + 8]) + rng.normal(0, 3, 2)) * 0.65
        k = ke
        f = canvas.copy(); draw_hand(f, tip); emit(f)

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
blob = cv2.GaussianBlur(rng.random((H, W)).astype(np.float32), (0, 0), 40)
blob = (blob - blob.min()) / (blob.max() - blob.min())

def color_region(x0, x1, seconds):
    global tip
    cxm = (x0 + x1) / 2; ww = max(1, x1 - x0)
    dist = np.sqrt(((xx - cxm) / ww) ** 2 + ((yy - H * 0.5) / H) ** 2)
    dist /= dist[:, x0:x1].max()
    field = dist * 0.7 + blob * 0.3
    region = np.zeros((H, W, 1), np.float32); region[:, x0:x1] = 1
    base = canvas.copy(); st = tip.copy(); nC = max(1, int(seconds * FPS))
    for i in range(nC):
        m = np.clip(((i + 1) / nC * 1.25 - field) / 0.18, 0, 1); m = (m * m * (3 - 2 * m))[..., None] * region
        canvas[:] = base * (1 - m) + colf * m
        f = canvas.copy(); p = st + (OFF - st) * ease(min(1, (i + 1) / (FPS * 0.9)))
        draw_hand(f, p); emit(f)
    canvas[:] = base * (1 - region) + colf * region
    tip = None

for idx, (x0, x1, t0) in enumerate(segs):
    t_next = segs[idx + 1][2] if idx + 1 < len(segs) else D
    window = max(2.5, t_next - t0)
    if args.fast:
        t_sk, t_col = min(2.2, window * 0.4), min(1.0, window * 0.2)
    else:
        t_sk = float(np.clip(window * 0.45, 2.0, 6.0))
        t_col = float(np.clip(window * 0.17, 1.2, 2.5))
    hold_until(t0)
    if len(segs) > 1:
        cam_mode[0] = 'panel'; cam_panel[0] = (x0 + x1) / 2
    cells = seg_cells(x0, x1)
    if not cells: continue
    pts = np.array(cells, np.float32)
    start = (pts[:, 0].mean(), pts[:, 1].min() + (pts[:, 1].max() - pts[:, 1].min()) * 0.3)
    if args.fast:
        # text: write line by line, left to right (lines = bands of 8 cells)
        cells.sort(key=lambda c: (c[1] // 8, c[0], c[1]))
    else:
        cells = nn_order(cells, start)
    c0 = cells[0]
    move_hand((c0[0] * CELL + 8, c0[1] * CELL + 8), 14)
    draw_cells(cells, t_sk)
    sub = (slice(None), slice(x0, x1))
    canvas[sub] = sketch[sub]
    color_region(x0, x1, t_col)

# after the last panel: open up to the full image and keep a slow push-in
cam_mode[0] = 'push'
final = canvas.copy()
while nframes < TOTAL: emit(final)
ff.stdin.close(); ff.wait()
print(f'{args.out}: {nframes / FPS:.2f}s')

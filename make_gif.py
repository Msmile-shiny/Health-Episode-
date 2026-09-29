# -*- coding: utf-8 -*-
"""把 Demo 的四个关键页面 + 头尾卡合成一段循环演示 GIF。"""
import os
from PIL import Image, ImageDraw, ImageFont

D = r'C:/Users/29383/AppData/Local/Temp/episode-shots/reel'
OUT = r'C:/Users/29383/Documents/Codex/2026-09-29/referenced-chatgpt-conversation-this-is-an-2/outputs/episode/demo-reel.gif'

W, H = 1000, 800
TEAL = (0x0D, 0x6B, 0x5C)
TEAL_D = (0x0A, 0x56, 0x4A)
MINT = (0x17, 0xB8, 0x97)
LIGHT_MINT = (0xB8, 0xE4, 0xDA)
WHITE = (255, 255, 255)

FONT_BOLD = r'C:\Windows\Fonts\msyhbd.ttc'
FONT_REG = r'C:\Windows\Fonts\msyh.ttc'


def load(name):
    im = Image.open(os.path.join(D, name)).convert('RGB')
    return im.resize((W, H), Image.LANCZOS)


def card(lines, top_label=None):
    img = Image.new('RGB', (W, H), TEAL)
    d = ImageDraw.Draw(img)

    # 顶部产品标记
    if top_label:
        f0 = ImageFont.truetype(FONT_BOLD, 22)
        d.text((48, 46), top_label, font=f0, fill=MINT)

    # 计算各文本行尺寸
    items = []
    for txt, size, color, bold in lines:
        f = ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)
        bb = d.textbbox((0, 0), txt, font=f)
        items.append((txt, f, color, bb[3] - bb[1]))

    line_hs = [h for (_, _, _, h) in items]
    gap = 26
    total = sum(line_hs) + gap * (len(items) - 1)
    y = (H - total) // 2

    for (txt, f, color, _), lh in zip(items, line_hs):
        bb = d.textbbox((0, 0), txt, font=f)
        w = bb[2] - bb[0]
        d.text(((W - w) // 2, y), txt, font=f, fill=color)
        y += lh + gap

    # 底部一条 mint 短线
    d.rectangle([W // 2 - 36, H - 90, W // 2 + 36, H - 84], fill=MINT)
    return img


intro = card([
    ('AI Health Navigator', 62, WHITE, True),
    ('现场演示 · Live Demo', 30, LIGHT_MINT, False),
], top_label='AI HEALTH NAVIGATOR · DEMO')

outro = card([
    ("We don't replace the doctor.", 46, WHITE, True),
    ('We manage the journey before you see one.', 28, MINT, False),
], top_label='AI HEALTH NAVIGATOR · DEMO')

seq = [intro, load('landing.png'), load('intake.png'),
       load('episode.png'), load('handoff.png'), outro]

HOLD = 14     # 每张停留帧数
XFADE = 5     # 交叉淡入帧数
DUR = 100     # 每帧毫秒

frames = []
for i, cur in enumerate(seq):
    for _ in range(HOLD):
        frames.append(cur)
    if i < len(seq) - 1:
        nxt = seq[i + 1]
        for k in range(1, XFADE + 1):
            a = k / (XFADE + 1)
            frames.append(Image.blend(cur, nxt, a))

# 每帧独立自适应调色板，提升文字清晰度
p_frames = [f.convert('P', palette=Image.ADAPTIVE, colors=256) for f in frames]

p_frames[0].save(OUT, save_all=True, append_images=p_frames[1:],
                 duration=DUR, loop=0, optimize=False)
print('saved:', OUT)
print('frames:', len(frames), 'size:', os.path.getsize(OUT), 'bytes')

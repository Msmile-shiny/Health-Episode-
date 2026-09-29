# -*- coding: utf-8 -*-
"""构建 AI Health Navigator 项目 Demo PPT（16:9）。"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# ---------- 配色（与 Demo 一致） ----------
TEAL   = RGBColor(0x0D, 0x6B, 0x5C)
TEAL_D = RGBColor(0x0A, 0x56, 0x4A)
MINT   = RGBColor(0x17, 0xB8, 0x97)
INK    = RGBColor(0x10, 0x22, 0x2B)
MUT    = RGBColor(0x4A, 0x5B, 0x64)
FAINT  = RGBColor(0x8A, 0x99, 0xA2)
BG     = RGBColor(0xF7, 0xFA, 0xF9)
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
TINT   = RGBColor(0xE6, 0xF2, 0xEF)
LINE   = RGBColor(0xDD, 0xE6, 0xE3)
SOFT   = RGBColor(0xEE, 0xF3, 0xF1)

FONT = "Microsoft YaHei"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]


def bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color


def shape(slide, st, l, t, w, h, fill=None, line=None, line_w=None, radius=None):
    shp = slide.shapes.add_shape(st, Inches(l), Inches(t), Inches(w), Inches(h))
    if radius is not None and st == MSO_SHAPE.ROUNDED_RECTANGLE:
        try:
            shp.adjustments[0] = radius
        except Exception:
            pass
    if fill is None:
        shp.fill.background()
    else:
        shp.fill.solid()
        shp.fill.fore_color.rgb = fill
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(line_w or 1)
    try:
        shp.shadow.inherit = False
    except Exception:
        pass
    return shp


def shape_text(shp, text_, size, color, bold=True, align=PP_ALIGN.CENTER,
               anchor=MSO_ANCHOR.MIDDLE, font=FONT, line_spacing=1.0):
    tf = shp.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = Inches(0.06)
    tf.margin_right = Inches(0.06)
    tf.margin_top = Inches(0.03)
    tf.margin_bottom = Inches(0.03)
    p = tf.paragraphs[0]
    p.alignment = align
    p.line_spacing = line_spacing
    r = p.add_run()
    r.text = text_
    r.font.name = font
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.color.rgb = color
    return shp


def add_text(slide, l, t, w, h, paras, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
             wrap=True, line_spacing=1.0):
    box = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = box.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, p in enumerate(paras):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = p.get('align', align)
        para.space_before = Pt(p.get('sb', 0))
        para.space_after = Pt(p.get('sa', 0))
        para.line_spacing = p.get('ls', line_spacing)
        runs = p.get('runs')
        if runs is None:
            runs = [{'text': p.get('text', ''), 'size': p.get('size', 16),
                     'bold': p.get('bold', False), 'color': p.get('color', INK)}]
        for r in runs:
            run = para.add_run()
            run.text = r['text']
            f = run.font
            f.name = r.get('font', FONT)
            f.size = Pt(r.get('size', 16))
            f.bold = r.get('bold', False)
            f.color.rgb = r.get('color', INK)
    return box


def header(slide, kicker, title):
    shape(slide, MSO_SHAPE.RECTANGLE, 0.9, 0.82, 0.1, 0.5, fill=MINT)
    add_text(slide, 1.18, 0.76, 11.2, 0.3, [
        {'text': kicker, 'size': 13, 'bold': True, 'color': TEAL}])
    add_text(slide, 1.18, 1.08, 11.2, 0.85, [
        {'text': title, 'size': 31, 'bold': True, 'color': INK}])


def footer(slide, n):
    add_text(slide, 0.9, 7.08, 6, 0.3, [
        {'text': 'AI Health Navigator · 项目 Demo', 'size': 10, 'color': FAINT}])
    add_text(slide, 11.9, 7.08, 0.55, 0.3, [
        {'text': str(n), 'size': 11, 'bold': True, 'color': MUT}],
        align=PP_ALIGN.RIGHT)


def light_slide():
    s = prs.slides.add_slide(BLANK)
    bg(s, BG)
    return s


def steps_row(slide, y, items, x0=0.9, total_w=11.5, box_h=0.85,
              fill=TINT, txt_color=INK, size=14):
    n = len(items)
    gap = 0.4
    box_w = (total_w - gap * (n - 1)) / n
    x = x0
    for i, it in enumerate(items):
        bx = shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, x, y, box_w, box_h,
                   fill=fill, radius=0.5)
        shape_text(bx, it, size, txt_color, bold=True)
        if i < n - 1:
            add_text(slide, x + box_w, y, gap, box_h, [
                {'text': '→', 'size': 17, 'bold': True, 'color': MUT}],
                align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        x += box_w + gap


# ============================================================
# 1. 封面
# ============================================================
s = prs.slides.add_slide(BLANK)
bg(s, TEAL)
# 顶部产品标记
mk = shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.95, 1.0, 0.72, 0.72, fill=MINT, radius=0.3)
shape_text(mk, "E", 28, TEAL_D, bold=True)
add_text(s, 1.85, 1.16, 9, 0.4, [
    {'text': 'AI HEALTH NAVIGATOR · 项目 DEMO', 'size': 14, 'bold': True, 'color': MINT}])
add_text(s, 0.95, 2.1, 11.5, 2.0, [
    {'text': '从身体出现异常，到见到医生的', 'size': 40, 'bold': True, 'color': WHITE, 'sa': 4},
    {'text': '连续健康导航', 'size': 40, 'bold': True, 'color': WHITE}])
add_text(s, 0.95, 4.35, 11.5, 0.5, [
    {'text': '建立 · 追踪 · 交接 —— 管理一次完整的 Health Episode', 'size': 18,
     'color': RGBColor(0xB8, 0xE4, 0xDA)}])
shape(s, MSO_SHAPE.RECTANGLE, 0.98, 5.55, 1.6, 0.045, fill=MINT)
add_text(s, 0.95, 5.85, 11.5, 0.9, [
    {'text': 'We don\'t replace the doctor.', 'size': 21, 'bold': True, 'color': WHITE, 'sa': 2},
    {'text': 'We manage the journey before you see one.', 'size': 15, 'color': MINT}])

# ============================================================
# 2. 产品定位 + 核心场景 + 核心用户画像
# ============================================================
s = light_slide()
header(s, '产品定位', '连续健康导航')
add_text(s, 0.9, 2.02, 11.5, 0.55, [
    {'text': '从身体出现异常，到决定是否就医，再到真正见到医生的连续健康导航。',
     'size': 18, 'bold': True, 'color': INK, 'ls': 1.2}])
shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.9, 2.7, 11.5, 1.12, fill=TINT, radius=0.14)
add_text(s, 1.3, 2.88, 10.8, 0.32, [
    {'text': '核心场景', 'size': 12, 'bold': True, 'color': TEAL}])
add_text(s, 1.3, 3.2, 10.8, 0.55, [
    {'text': '“我有点不舒服，但不知道现在该怎么办。”', 'size': 20, 'bold': True, 'color': INK}])
add_text(s, 0.9, 4.06, 11.5, 0.34, [
    {'text': '核心用户画像', 'size': 13, 'bold': True, 'color': TEAL}])
personas = [
    ('上班族', '请假难，就医时间成本高'),
    ('学生', '学习 / 工作压力大，忽视身体信号'),
    ('高压人群', '难以顾及自己的身体'),
]
px = 0.9
for title, desc in personas:
    shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, px, 4.46, 3.7, 1.02, fill=WHITE,
          line=LINE, line_w=1.1, radius=0.12)
    add_text(s, px + 0.25, 4.6, 3.2, 0.34, [
        {'text': title, 'size': 15, 'bold': True, 'color': INK}])
    add_text(s, px + 0.25, 4.97, 3.2, 0.4, [
        {'text': desc, 'size': 11.5, 'color': MUT, 'ls': 1.05}])
    px += 3.9
add_text(s, 0.9, 5.72, 11.5, 0.3, [
    {'text': '从异常到就医，一条连续的线索', 'size': 12.5, 'bold': True, 'color': MUT}])
steps_row(s, 6.06, ['身体出现异常', '决定是否就医', '真正见到医生'], fill=WHITE,
          txt_color=TEAL, size=14, box_h=0.72)
footer(s, 2)

# ============================================================
# 3. 两大核心功能
# ============================================================
s = light_slide()
header(s, '核心功能', '两大核心功能')
cards = [
    ('①', 'Continuous Self-Triage',
     '建立 Health Episode，根据症状随时间的变化，持续重新评估下一步行动。'),
    ('②', 'Doctor Handoff',
     '真正需要专业医疗时，将 Episode 自动整理为结构化就医摘要。'),
]
for i, (num, title, desc) in enumerate(cards):
    x = 0.9 + i * 5.95
    c = shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, x, 2.35, 5.6, 3.4, fill=WHITE,
              line=LINE, line_w=1.2, radius=0.08)
    shape_text(shape(s, MSO_SHAPE.OVAL, x + 0.4, 2.75, 0.62, 0.62, fill=TINT),
               num, 18, TEAL, bold=True)
    add_text(s, x + 0.4, 3.6, 4.9, 0.6, [
        {'text': title, 'size': 19, 'bold': True, 'color': INK}])
    add_text(s, x + 0.4, 4.25, 4.9, 1.2, [
        {'text': desc, 'size': 14.5, 'color': MUT, 'ls': 1.3}])
footer(s, 3)

# ============================================================
# 4. 01 Problem
# ============================================================
s = light_slide()
header(s, '01 · PROBLEM', '为什么需要它')
add_text(s, 0.9, 2.25, 5.3, 0.6, [
    {'text': '用户真正困惑的，往往不是「这是什么病」，而是：', 'size': 17, 'bold': True,
     'color': INK, 'ls': 1.2}])
qs = ['我现在该怎么办？', '需要去医院吗？', '什么时候不能再等？']
for i, q in enumerate(qs):
    y = 3.05 + i * 0.78
    shape(s, MSO_SHAPE.RECTANGLE, 0.9, y, 0.09, 0.62, fill=MINT)
    add_text(s, 1.15, y, 5.0, 0.62, [
        {'text': q, 'size': 20, 'bold': True, 'color': TEAL}], anchor=MSO_ANCHOR.MIDDLE)
# 右侧：现有体验割裂
c = shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 6.7, 2.25, 5.7, 4.0, fill=WHITE,
          line=LINE, line_w=1.2, radius=0.08)
add_text(s, 7.1, 2.6, 4.9, 0.5, [
    {'text': '现有体验是割裂的', 'size': 16, 'bold': True, 'color': INK}])
rows = [
    ('搜索 / AI 问答', '一次性的，答完即走'),
    ('健康数据', '缺少解释，看不懂趋势'),
    ('真正就医', '又要从头向医生描述一遍'),
]
for i, (a, b) in enumerate(rows):
    y = 3.3 + i * 0.95
    add_text(s, 7.1, y, 4.9, 0.4, [
        {'text': a, 'size': 15, 'bold': True, 'color': INK, 'sa': 2},
        {'text': b, 'size': 13.5, 'color': MUT}])
footer(s, 4)

# ============================================================
# 5. 02 Solution
# ============================================================
s = light_slide()
header(s, '02 · SOLUTION', '产品具体做什么')
steps = [
    ('1', '描述不适 → AI 结构化分诊',
     '补齐症状、程度、时长，筛查危险信号，给出「继续观察 / 密切观察 / 建议咨询 / 尽快就医」四层建议。'),
    ('2', '建立 Health Episode → 持续追踪',
     '每次打卡更新一条症状曲线，随时间重新评估下一步行动，而不是每次从零回答。'),
    ('3', '需要就医时 → Doctor Handoff',
     '一键生成结构化就医摘要：主诉 / 现病史 / 症状趋势 / 已排查危险信号。'),
]
y = 2.3
for n, name, desc in steps:
    shape_text(shape(s, MSO_SHAPE.OVAL, 0.9, y + 0.05, 0.5, 0.5, fill=MINT),
               n, 15, TEAL_D, bold=True)
    add_text(s, 1.62, y, 10.7, 0.42, [
        {'text': name, 'size': 16.5, 'bold': True, 'color': INK}])
    add_text(s, 1.62, y + 0.44, 10.7, 0.62, [
        {'text': desc, 'size': 12.5, 'color': MUT, 'ls': 1.22}])
    y += 1.24
c = shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.9, 6.12, 11.5, 0.66, fill=TINT, radius=0.35)
add_text(s, 1.2, 6.12, 11.0, 0.66, [
    {'text': '核心不是替代医生诊断，而是把一次 Health Episode 从头管到尾。',
     'size': 14.5, 'bold': True, 'color': TEAL}], anchor=MSO_ANCHOR.MIDDLE)
footer(s, 5)

# ============================================================
# 6. 03 Demo 流程
# ============================================================
s = light_slide()
header(s, '03 · DEMO', '核心用户流程')
add_text(s, 0.9, 2.02, 11.5, 0.4, [
    {'text': '身体不舒服', 'size': 13, 'bold': True, 'color': MUT}])
steps = [
    ('1', 'AI Self-Triage', 'AI 结构化分诊', '结构化了解症状与背景'),
    ('2', 'Health Episode', '健康事件', '自动建立健康事件并持续记录'),
    ('3', 'Continuous Follow-up', '持续追踪', '追踪症状变化并重新评估'),
    ('4', 'Next-step Navigation', '下一步导航', '继续观察 / 寻求专业医疗'),
    ('5', 'Doctor Handoff', '就医摘要', '生成结构化就医摘要'),
]
y = 2.42
for n, en, zh, desc in steps:
    shape_text(shape(s, MSO_SHAPE.OVAL, 0.9, y + 0.03, 0.5, 0.5, fill=MINT),
               n, 15, TEAL_D, bold=True)
    add_text(s, 1.62, y, 10.7, 0.35, [
        {'runs': [
            {'text': en, 'size': 15.5, 'bold': True, 'color': INK},
            {'text': '   ' + zh, 'size': 15.5, 'bold': True, 'color': TEAL},
        ]}])
    add_text(s, 1.62, y + 0.34, 10.7, 0.32, [
        {'text': desc, 'size': 12.5, 'color': MUT}])
    y += 0.78
c = shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.9, 6.28, 11.5, 0.62, fill=WHITE,
          line=LINE, line_w=1.0, radius=0.35)
add_text(s, 1.2, 6.28, 11.0, 0.62, [
    {'runs': [
        {'text': '现场重点演示三个页面：', 'size': 13.5, 'bold': True, 'color': INK},
        {'text': '首次分诊 → Episode 时间线 → Doctor Handoff', 'size': 13.5, 'bold': True, 'color': TEAL},
    ]}], anchor=MSO_ANCHOR.MIDDLE)
footer(s, 6)

# ============================================================
# 7. Demo 现场预览（自动播放 GIF）
# ============================================================
GIF = r"C:\Users\29383\Documents\Codex\2026-09-29\referenced-chatgpt-conversation-this-is-an-2\outputs\episode\demo-reel.gif"
s = light_slide()
header(s, '03 · DEMO', '现场预览')
fr_w, fr_h = 5.6, 4.42
fr_x = (13.333 - fr_w) / 2
fr_y = 2.12
shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, fr_x, fr_y, fr_w, fr_h, fill=WHITE,
      line=LINE, line_w=1.4, radius=0.05)
pic_w = 5.35
pic_x = (13.333 - pic_w) / 2
pic_y = fr_y + (fr_h - (pic_w * 800 / 1000)) / 2
s.shapes.add_picture(GIF, Inches(pic_x), Inches(pic_y), width=Inches(pic_w))
add_text(s, 0.9, 6.7, 11.53, 0.35, [
    {'runs': [
        {'text': '现场演示（自动播放）', 'size': 13, 'bold': True, 'color': MUT},
        {'text': '   首次分诊 → Episode 时间线 → Doctor Handoff', 'size': 13, 'bold': True, 'color': TEAL},
    ]}], align=PP_ALIGN.CENTER)
footer(s, 7)

# ============================================================
# 8. 04 Why AI
# ============================================================
s = light_slide()
header(s, '04 · WHY AI', '为什么以前难做')
add_text(s, 0.9, 2.4, 5.3, 2.4, [
    {'text': 'AI 的价值不只是聊天，而是把', 'size': 17, 'color': INK, 'ls': 1.4},
    {'runs': [
        {'text': '多轮自然语言', 'size': 17, 'bold': True, 'color': TEAL},
        {'text': '、', 'size': 17, 'color': INK},
        {'text': '症状变化', 'size': 17, 'bold': True, 'color': TEAL},
        {'text': '和', 'size': 17, 'color': INK},
        {'text': '个人背景', 'size': 17, 'bold': True, 'color': TEAL},
    ], 'sa': 0},
    {'text': '转化成持续更新的健康状态，而不是每次从零回答问题。', 'size': 17, 'color': INK, 'ls': 1.4},
])
# 右侧：技术核心盒
add_text(s, 6.9, 2.35, 5.5, 0.35, [
    {'text': '技术核心', 'size': 12.5, 'bold': True, 'color': MINT}])
box = shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 6.9, 2.72, 5.5, 1.15, fill=TEAL, radius=0.14)
shape_text(box, 'Longitudinal Health Reasoning', 21, WHITE, bold=True)
add_text(s, 6.9, 4.05, 5.5, 0.9, [
    {'text': '多轮 NL · 症状变化 · 个人背景', 'size': 13.5, 'bold': True, 'color': INK, 'sa': 2},
    {'text': '→ 持续更新的健康状态', 'size': 13.5, 'bold': True, 'color': TEAL},
])
footer(s, 8)

# ============================================================
# 8. 05 Moat
# ============================================================
s = light_slide()
header(s, '05 · MOAT', '未来核心竞争力')
pillars = [
    ('Health Episode 数据', '每一次健康事件的完整纵向记录'),
    ('经验证的分诊系统', '可追溯、可验证的分层建议'),
    ('Personal Baseline', '了解「我的正常状态」'),
    ('医疗服务连接', '从导航到就医的无缝交接'),
]
x = 0.9
for name, desc in pillars:
    c = shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, x, 2.3, 2.75, 1.95, fill=WHITE,
              line=LINE, line_w=1.2, radius=0.1)
    add_text(s, x + 0.22, 2.5, 2.3, 0.5, [
        {'text': name, 'size': 13.5, 'bold': True, 'color': TEAL, 'ls': 1.1}])
    add_text(s, x + 0.22, 3.35, 2.3, 0.8, [
        {'text': desc, 'size': 11.5, 'color': MUT, 'ls': 1.2}])
    x += 2.92
add_text(s, 0.9, 4.6, 11.5, 0.4, [
    {'text': '随着使用积累，从「这次该怎么办」进一步发展到：', 'size': 14, 'bold': True, 'color': INK}])
steps_row(s, 5.1, ['了解我的正常状态', '发现异常变化', '主动健康提醒', '连续健康管理'],
          fill=TINT, txt_color=TEAL, size=13)
footer(s, 9)

# ============================================================
# 9. 06 Business Model
# ============================================================
s = light_slide()
header(s, '06 · BUSINESS MODEL', '商业模式')
cards = [
    ('Consumer · 消费者', [('免费分诊', '高级持续健康管理')]),
    ('Healthcare · 医疗', [('患者导航', '临床接诊 SaaS')]),
    ('Long-term · 长期', [('企业 / 保险健康导航', None)]),
]
x = 0.9
cw = 3.7
for title, flow in cards:
    shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, x, 2.5, cw, 3.2, fill=WHITE,
          line=LINE, line_w=1.2, radius=0.08)
    add_text(s, x + 0.3, 2.78, cw - 0.6, 0.5, [
        {'text': title, 'size': 15.5, 'bold': True, 'color': TEAL}])
    a, b = flow[0]
    if b:
        add_text(s, x + 0.3, 3.5, cw - 0.6, 0.5, [
            {'text': a, 'size': 14, 'bold': True, 'color': INK}])
        add_text(s, x + 0.3, 4.0, cw - 0.6, 0.4, [
            {'text': '↓', 'size': 15, 'bold': True, 'color': MUT}],
            align=PP_ALIGN.CENTER)
        add_text(s, x + 0.3, 4.45, cw - 0.6, 0.7, [
            {'text': b, 'size': 14, 'bold': True, 'color': MINT, 'ls': 1.15}])
    else:
        add_text(s, x + 0.3, 3.75, cw - 0.6, 1.3, [
            {'text': a, 'size': 14.5, 'bold': True, 'color': INK, 'ls': 1.3}],
            anchor=MSO_ANCHOR.MIDDLE)
    x += cw + 0.2
add_text(s, 0.9, 6.2, 11.5, 0.6, [
    {'text': '从免费导航切入，逐步向持续健康管理、临床 SaaS 与保险健康导航延伸。',
     'size': 13.5, 'color': MUT}])
footer(s, 10)

# ============================================================
# 9. 收尾
# ============================================================
s = prs.slides.add_slide(BLANK)
bg(s, TEAL)
add_text(s, 0.95, 2.7, 11.5, 1.1, [
    {'text': 'We don\'t replace the doctor.', 'size': 40, 'bold': True, 'color': WHITE}])
add_text(s, 0.95, 3.95, 11.5, 0.6, [
    {'text': 'We manage the journey before you see one.', 'size': 22, 'color': MINT}])
shape(s, MSO_SHAPE.RECTANGLE, 0.98, 5.05, 1.6, 0.045, fill=MINT)
add_text(s, 0.95, 5.35, 11.5, 0.4, [
    {'text': 'AI Health Navigator · 概念 Demo（虚构数据，不替代专业医疗建议）',
     'size': 13, 'color': RGBColor(0xB8, 0xE4, 0xDA)}])

out = r"C:\Users\29383\Documents\Codex\2026-09-29\referenced-chatgpt-conversation-this-is-an-2\outputs\episode\AI-Health-Navigator-Demo-v3.pptx"
prs.save(out)
print("saved:", out)
print("slides:", len(prs.slides._sldIdLst))

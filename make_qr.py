# -*- coding: utf-8 -*-
"""生成 Demo 站点的二维码图片（demo-qr.png）。"""
import qrcode

URL = "https://msmile-shiny.github.io/Health-Episode-/"

qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,  # 高纠错，扫描更稳
    box_size=12,
    border=4,
)
qr.add_data(URL)
qr.make(fit=True)
img = qr.make_image(fill_color="#0A564A", back_color="white")
img.save("demo-qr.png")
print("saved demo-qr.png", img.size, "| URL:", URL)

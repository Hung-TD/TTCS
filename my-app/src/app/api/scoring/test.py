from transformers import DonutProcessor, VisionEncoderDecoderModel

# Tải processor và mô hình Donut
processor = DonutProcessor.from_pretrained("naver-clova-ix/donut-base")
model = VisionEncoderDecoderModel.from_pretrained("naver-clova-ix/donut-base")

print("✅ Mô hình Donut đã được tải thành công!")

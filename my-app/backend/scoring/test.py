import requests

data = {
    'text': 'Tôi đag học tiêngg Anh.',
    'language': 'vi'
}

response = requests.post('https://api.languagetool.org/v2/check', data=data)

# In nội dung trả về để kiểm tra
print("Status code:", response.status_code)
print("Response text:", response.text)

# Nếu phản hồi hợp lệ (code 200), mới chuyển sang JSON
if response.status_code == 200:
    results = response.json()
    for match in results['matches']:
        print(f"Lỗi: {match['message']}")
        print(f"Đề xuất: {[r['value'] for r in match['replacements']]}")
        print("---")
else:
    print("❌ Có lỗi xảy ra khi gọi API.")

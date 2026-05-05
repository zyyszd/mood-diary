import sys
import os

# 添加项目根目录到 Python 路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.text.text_emotion_model import TextEmotionModel

# 初始化模型
text_model = TextEmotionModel()

def analyze_text_emotion(text):
    """分析文本情感"""
    try:
        # 分析情感
        emotion, confidence = text_model.predict(text)
        
        # 生成响应
        response = {
            'emotion': emotion,
            'confidence': confidence,
            'text': text
        }
        
        return response
    except Exception as e:
        return {'error': str(e)}

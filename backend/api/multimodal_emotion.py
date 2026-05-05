import sys
import os

# 添加项目根目录到 Python 路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.multimodal.multimodal_emotion_model import MultimodalEmotionModel

# 初始化模型
multimodal_model = MultimodalEmotionModel()

def analyze_multimodal_emotion(text, audio_path):
    """分析多模态情感"""
    try:
        # 分析情感
        emotion, confidence = multimodal_model.predict(text, audio_path)
        
        # 生成响应
        response = {
            'emotion': emotion,
            'confidence': confidence
        }
        
        return response
    except Exception as e:
        return {'error': str(e)}

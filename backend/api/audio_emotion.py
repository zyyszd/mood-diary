import sys
import os
import tempfile

# 添加项目根目录到 Python 路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.audio.audio_emotion_model import AudioEmotionModel

# 初始化模型
audio_model = AudioEmotionModel()

def analyze_audio_emotion(file):
    """分析音频情感"""
    try:
        # 保存临时文件
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        # 分析情感
        emotion, confidence = audio_model.predict(temp_path)
        
        # 删除临时文件
        os.unlink(temp_path)
        
        # 生成响应
        response = {
            'emotion': emotion,
            'confidence': confidence
        }
        
        return response
    except Exception as e:
        return {'error': str(e)}

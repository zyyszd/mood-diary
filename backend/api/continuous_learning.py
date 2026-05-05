import sys
import os

# 添加项目根目录到 Python 路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.text.text_emotion_model import TextEmotionModel

# 初始化模型
text_model = TextEmotionModel()

def update_model(text, emotion):
    """更新模型，实现持续学习"""
    try:
        # 更新模型
        success = text_model.update(text, emotion)
        
        # 生成响应
        response = {
            'success': success,
            'message': 'Model updated successfully' if success else 'Failed to update model'
        }
        
        return response
    except Exception as e:
        return {'error': str(e)}

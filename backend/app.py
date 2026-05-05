from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# 添加项目根目录到 Python 路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from api.chat import chat_with_llm
except:
    chat_with_llm = None

try:
    from api.audio_transcribe import transcribe_audio
except:
    transcribe_audio = None

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 简单的情绪分析Mock函数
def mock_text_emotion(text):
    """简单的文本情绪分析Mock"""
    emotions = ['开心', '平静', '疲惫', '焦虑', '紧张', '失落', '生气', '期待']
    # 简单的关键词匹配
    if '开心' in text or '高兴' in text or '快乐' in text:
        return {'emotion': '开心', 'confidence': 0.8, 'text': text}
    elif '累' in text or '疲惫' in text or '辛苦' in text:
        return {'emotion': '疲惫', 'confidence': 0.8, 'text': text}
    elif '焦虑' in text or '担心' in text or '紧张' in text:
        return {'emotion': '焦虑', 'confidence': 0.8, 'text': text}
    elif '难过' in text or '伤心' in text or '悲伤' in text:
        return {'emotion': '失落', 'confidence': 0.8, 'text': text}
    else:
        return {'emotion': '平静', 'confidence': 0.6, 'text': text}

@app.route('/api/text-emotion', methods=['POST'])
def text_emotion():
    data = request.json
    text = data.get('text')
    if not text:
        return jsonify({'error': 'Text is required'}), 400
    
    result = mock_text_emotion(text)
    return jsonify(result)

@app.route('/api/audio-emotion', methods=['POST'])
def audio_emotion():
    if 'file' not in request.files:
        return jsonify({'error': 'Audio file is required'}), 400
    
    # Mock响应
    return jsonify({'emotion': '平静', 'confidence': 0.6})

@app.route('/api/multimodal-emotion', methods=['POST'])
def multimodal_emotion():
    data = request.json
    text = data.get('text')
    audio_path = data.get('audio_path')
    
    if not text and not audio_path:
        return jsonify({'error': 'At least one modality is required'}), 400
    
    # Mock响应
    return jsonify({'emotion': '平静', 'confidence': 0.6})

@app.route('/api/update-model', methods=['POST'])
def update_model_endpoint():
    data = request.json
    text = data.get('text')
    emotion = data.get('emotion')
    
    if not text or not emotion:
        return jsonify({'error': 'Text and emotion are required'}), 400
    
    # Mock响应
    return jsonify({'success': True, 'message': 'Model updated successfully (mock)'})

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    data = request.json
    message = data.get('message')
    history = data.get('history', [])
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    if chat_with_llm:
        reply = chat_with_llm(message, history)
        if reply:
            return jsonify({'reply': reply})
    
    # Fallback回复
    fallback_replies = [
        '谢谢你和我分享这些。你现在感觉怎么样？',
        '我能理解你的感受。能和我多说说吗？',
        '听起来你最近经历了一些事情。愿意和我聊聊吗？',
        '谢谢你信任我。我在这里倾听。',
        '你的感受是合理的。继续和我说说吧。'
    ]
    import random
    return jsonify({'reply': random.choice(fallback_replies)})

@app.route('/api/audio-transcribe', methods=['POST'])
def audio_transcribe_endpoint():
    if 'file' not in request.files:
        return jsonify({'error': 'Audio file is required'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if transcribe_audio:
        text = transcribe_audio(file)
        if text:
            return jsonify({'text': text})
    
    # Mock响应
    return jsonify({'text': ''})

if __name__ == '__main__':
    print('🚀 后端服务启动中...')
    print('📌 服务地址: http://localhost:5000')
    print('📌 可用API:')
    print('   - POST /api/chat           - AI聊天')
    print('   - POST /api/text-emotion   - 文本情绪分析')
    print('   - POST /api/audio-transcribe - 语音转文字')
    print('   - POST /api/audio-emotion  - 音频情绪分析')
    print('   - POST /api/multimodal-emotion - 多模态情绪分析')
    print('   - POST /api/update-model   - 更新模型')
    app.run(host='0.0.0.0', port=5000, debug=True)

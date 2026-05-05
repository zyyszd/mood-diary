import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests

OLLAMA_URL = os.environ.get('OLLAMA_URL', 'http://localhost:11434')
DEFAULT_MODEL = os.environ.get('OLLAMA_MODEL', 'llama3.2')

def chat_with_llm(message, history=None, model=None):
    """使用 Ollama 本地大模型进行对话"""
    try:
        use_model = model or DEFAULT_MODEL

        formatted_history = []
        if history:
            for msg in history:
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                if role == 'user':
                    formatted_history.append({
                        'role': 'user',
                        'content': content
                    })
                else:
                    formatted_history.append({
                        'role': 'assistant',
                        'content': content
                    })

        formatted_history.append({
            'role': 'user',
            'content': message
        })

        payload = {
            'model': use_model,
            'messages': formatted_history,
            'stream': False
        }

        response = requests.post(
            f'{OLLAMA_URL}/api/chat',
            json=payload,
            timeout=60
        )

        if response.status_code == 200:
            data = response.json()
            return data.get('message', {}).get('content', '')
        else:
            return None

    except requests.exceptions.ConnectionError:
        return None
    except requests.exceptions.Timeout:
        return None
    except Exception as e:
        print(f'LLM Error: {e}')
        return None

def check_ollama_status():
    """检查 Ollama 服务是否可用"""
    try:
        response = requests.get(f'{OLLAMA_URL}/api/tags', timeout=5)
        return response.status_code == 200
    except:
        return False

def get_available_models():
    """获取可用的模型列表"""
    try:
        response = requests.get(f'{OLLAMA_URL}/api/tags', timeout=5)
        if response.status_code == 200:
            data = response.json()
            return [m.get('name') for m in data.get('models', [])]
        return []
    except:
        return []

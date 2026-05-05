import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import tempfile
import subprocess

WHISPER_API_URL = os.environ.get('WHISPER_API_URL', 'http://localhost:5001')

def transcribe_audio(audio_file):
    """将音频转写为文字"""
    try:
        files = {
            'file': (audio_file.filename, audio_file.stream, audio_file.content_type or 'audio/mp3')
        }

        response = requests.post(
            f'{WHISPER_API_URL}/transcribe',
            files=files,
            timeout=60
        )

        if response.status_code == 200:
            data = response.json()
            return data.get('text', '')
        else:
            return fallback_transcribe(audio_file)

    except requests.exceptions.ConnectionError:
        return fallback_transcribe(audio_file)
    except Exception as e:
        print(f'Transcribe Error: {e}')
        return fallback_transcribe(audio_file)

def fallback_transcribe(audio_file):
    """备用转写方案 - 返回提示信息"""
    return ''

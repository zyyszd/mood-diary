import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import librosa
import numpy as np
import os
import pandas as pd

class AudioEmotionDataset(Dataset):
    def __init__(self, audio_paths, labels):
        self.audio_paths = audio_paths
        self.labels = labels
    
    def __len__(self):
        return len(self.audio_paths)
    
    def __getitem__(self, idx):
        audio_path = self.audio_paths[idx]
        label = self.labels[idx]
        
        # 提取特征
        y, sr = librosa.load(audio_path, sr=16000)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        mfcc_mean = np.mean(mfcc, axis=1)
        
        return {
            'features': torch.tensor(mfcc_mean, dtype=torch.float32),
            'label': torch.tensor(label, dtype=torch.long)
        }

class AudioEmotionModel(nn.Module):
    def __init__(self, num_classes):
        super(AudioEmotionModel, self).__init__()
        self.model = nn.Sequential(
            nn.Linear(40, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, num_classes)
        )
    
    def forward(self, x):
        return self.model(x)

def train_audio_emotion_model():
    # 情感标签映射
    emotion_labels = {
        'angry': 0,
        'sad': 1,
        'neutral': 2,
        'happy': 3,
        'surprise': 4,
        'fear': 5,
        'disgust': 6
    }
    
    # 注意：这里需要替换为真实的音频数据集路径
    # 示例数据格式：[(audio_path, emotion), ...]
    # 由于没有真实的音频数据，这里使用模拟数据
    # 实际应用中，需要准备真实的音频数据集
    
    # 模拟数据
    sample_data = []
    for emotion in emotion_labels.keys():
        for i in range(10):  # 每个情感类别生成10个样本
            # 生成随机音频特征作为模拟数据
            # 实际应用中，这里应该是真实的音频文件路径
            sample_data.append(('dummy_audio.wav', emotion))
    
    # 转换为DataFrame
    df = pd.DataFrame(sample_data, columns=['audio_path', 'emotion'])
    df['label'] = df['emotion'].map(emotion_labels)
    
    # 分割数据集
    from sklearn.model_selection import train_test_split
    train_paths, val_paths, train_labels, val_labels = train_test_split(
        df['audio_path'].tolist(), df['label'].tolist(), test_size=0.2, random_state=42
    )
    
    # 创建数据集和数据加载器
    # 注意：由于使用的是模拟数据，这里需要修改为真实的实现
    # 实际应用中，需要从真实的音频文件中提取特征
    
    # 由于没有真实的音频数据，这里直接创建随机特征作为模拟数据
    def create_dummy_features(batch_size, num_features=40):
        return torch.randn(batch_size, num_features)
    
    # 初始化模型
    num_classes = len(emotion_labels)
    model = AudioEmotionModel(num_classes)
    
    # 设置训练参数
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    
    # 训练模型（使用模拟数据）
    num_epochs = 10
    batch_size = 8
    
    for epoch in range(num_epochs):
        print(f'Epoch {epoch+1}/{num_epochs}')
        print('-' * 10)
        
        # 训练
        model.train()
        train_loss = 0
        
        # 模拟训练数据
        for i in range(0, len(train_paths), batch_size):
            batch_size_current = min(batch_size, len(train_paths) - i)
            features = create_dummy_features(batch_size_current).to(device)
            labels = torch.tensor(train_labels[i:i+batch_size_current], dtype=torch.long).to(device)
            
            optimizer.zero_grad()
            outputs = model(features)
            loss = criterion(outputs, labels)
            train_loss += loss.item()
            
            loss.backward()
            optimizer.step()
        
        avg_train_loss = train_loss / (len(train_paths) // batch_size)
        print(f'Training loss: {avg_train_loss:.4f}')
        
        # 验证
        model.eval()
        val_loss = 0
        correct_predictions = 0
        
        with torch.no_grad():
            for i in range(0, len(val_paths), batch_size):
                batch_size_current = min(batch_size, len(val_paths) - i)
                features = create_dummy_features(batch_size_current).to(device)
                labels = torch.tensor(val_labels[i:i+batch_size_current], dtype=torch.long).to(device)
                
                outputs = model(features)
                loss = criterion(outputs, labels)
                val_loss += loss.item()
                
                predictions = torch.argmax(outputs, dim=1)
                correct_predictions += torch.sum(predictions == labels).item()
        
        avg_val_loss = val_loss / (len(val_paths) // batch_size)
        val_accuracy = correct_predictions / len(val_paths)
        print(f'Validation loss: {avg_val_loss:.4f}')
        print(f'Validation accuracy: {val_accuracy:.4f}')
    
    # 保存模型
    model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'audio', 'audio_emotion_model.pth')
    torch.save(model.state_dict(), model_path)
    print(f'Model saved to {model_path}')

if __name__ == '__main__':
    train_audio_emotion_model()

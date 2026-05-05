import torch
from torch.utils.data import Dataset, DataLoader
from transformers import BertTokenizer, BertForSequenceClassification, AdamW, get_linear_schedule_with_warmup
import pandas as pd
import numpy as np
import os
import json

class EmotionDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        label = self.labels[idx]
        
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            return_token_type_ids=False,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

def train_text_emotion_model():
    # 情感标签映射
    emotion_labels = {
        'angry': 0,
        'sad': 1,
        'neutral': 2,
        'happy': 3,
        'surprise': 4,
        'fear': 5,
        'disgust': 6,
        'anxious': 7,
        'tired': 8,
        'confused': 9
    }
    
    # 加载数据集（这里使用示例数据，实际应用中需要替换为真实数据集）
    # 示例数据格式：[{'text': 'I am happy', 'emotion': 'happy'}, ...]
    sample_data = [
        {'text': 'I am so happy today!', 'emotion': 'happy'},
        {'text': 'I feel sad and lonely', 'emotion': 'sad'},
        {'text': 'I am angry at my boss', 'emotion': 'angry'},
        {'text': 'I am feeling anxious about the exam', 'emotion': 'anxious'},
        {'text': 'I am tired after a long day', 'emotion': 'tired'},
        {'text': 'I am confused about what to do', 'emotion': 'confused'},
        {'text': 'I am surprised by the news', 'emotion': 'surprise'},
        {'text': 'I am afraid of the dark', 'emotion': 'fear'},
        {'text': 'I am disgusted by the smell', 'emotion': 'disgust'},
        {'text': 'I am feeling neutral', 'emotion': 'neutral'}
    ]
    
    # 扩展示例数据
    expanded_data = []
    for item in sample_data:
        for i in range(10):  # 每个示例复制10次
            expanded_data.append(item)
    
    # 转换为DataFrame
    df = pd.DataFrame(expanded_data)
    
    # 转换标签
    df['label'] = df['emotion'].map(emotion_labels)
    
    # 分割数据集
    from sklearn.model_selection import train_test_split
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        df['text'].tolist(), df['label'].tolist(), test_size=0.2, random_state=42
    )
    
    # 初始化tokenizer和模型
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    model = BertForSequenceClassification.from_pretrained('bert-base-uncased', 
                                                        num_labels=len(emotion_labels))
    
    # 创建数据集和数据加载器
    train_dataset = EmotionDataset(train_texts, train_labels, tokenizer)
    val_dataset = EmotionDataset(val_texts, val_labels, tokenizer)
    
    train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=8, shuffle=False)
    
    # 设置训练参数
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)
    
    optimizer = AdamW(model.parameters(), lr=2e-5, eps=1e-8)
    total_steps = len(train_loader) * 3  # 3个epoch
    scheduler = get_linear_schedule_with_warmup(
        optimizer, num_warmup_steps=0, num_training_steps=total_steps
    )
    
    # 训练模型
    for epoch in range(3):
        print(f'Epoch {epoch+1}/{3}')
        print('-' * 10)
        
        # 训练
        model.train()
        train_loss = 0
        
        for batch in train_loader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)
            
            optimizer.zero_grad()
            outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss
            train_loss += loss.item()
            
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
        
        avg_train_loss = train_loss / len(train_loader)
        print(f'Training loss: {avg_train_loss:.4f}')
        
        # 验证
        model.eval()
        val_loss = 0
        correct_predictions = 0
        
        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                labels = batch['labels'].to(device)
                
                outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
                loss = outputs.loss
                val_loss += loss.item()
                
                logits = outputs.logits
                predictions = torch.argmax(logits, dim=1)
                correct_predictions += torch.sum(predictions == labels).item()
        
        avg_val_loss = val_loss / len(val_loader)
        val_accuracy = correct_predictions / len(val_dataset)
        print(f'Validation loss: {avg_val_loss:.4f}')
        print(f'Validation accuracy: {val_accuracy:.4f}')
    
    # 保存模型
    model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'text', 'text_emotion_model.pth')
    torch.save(model.state_dict(), model_path)
    print(f'Model saved to {model_path}')

if __name__ == '__main__':
    train_text_emotion_model()

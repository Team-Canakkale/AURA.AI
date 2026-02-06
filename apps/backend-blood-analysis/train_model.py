import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import json
import joblib
import os

# Dosya yolları
dataset_path = r"C:\Users\casper\OneDrive - comu.edu.tr\Masaüstü\diagnosed_cbc_data_v4.csv"
model_save_path = "blood_analysis_model.h5"
scaler_save_path = "scaler.pkl"
label_encoder_save_path = "label_encoder.pkl"
class_names_save_path = "class_names.json"

def main():
    print("Veri yükleniyor...")
    try:
        df = pd.read_csv(dataset_path)
    except FileNotFoundError:
        print(f"Hata: Dataset bulunamadı: {dataset_path}")
        return

    # 2. Veri Temizliği
    print("Veri temizleniyor...")
    initial_count = len(df)
    # Hatalı verileri temizle: HCT > 60 veya HGB < 2
    # Not: İstenen şartları sağlamayanları tutuyoruz (HCT <= 60 ve HGB >= 2)
    df = df[(df['HCT'] <= 60) & (df['HGB'] >= 2)]
    final_count = len(df)
    print(f"{initial_count - final_count} hatalı satır silindi.")

    # 3. Ön İşleme
    print("Ön işleme yapılıyor...")
    X = df.drop('Diagnosis', axis=1)
    y = df['Diagnosis']

    # Label Encoding
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Sınıf isimlerini kaydetme hazırlığı
    class_names = {index: label for index, label in enumerate(le.classes_)}
    
    # Scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42)

    # 4. Model Mimarisi
    print("Model oluşturuluyor...")
    num_classes = len(le.classes_)
    
    model = tf.keras.models.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(16, activation='relu'),
        tf.keras.layers.Dense(num_classes, activation='softmax')
    ])

    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])

    # 5. Eğitim
    print("Model eğitiliyor...")
    history = model.fit(X_train, y_train, epochs=40, validation_split=0.1, verbose=1)

    # 6. Değerlendirme
    print("Model değerlendiriliyor...")
    loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"\nTest Seti Başarısı (Accuracy): {accuracy:.4f}")

    # 7. Kaydetme
    print("Dosyalar kaydediliyor...")
    
    # Modeli kaydet
    model.save(model_save_path)
    print(f"Model kaydedildi: {model_save_path}")

    # Scaler'ı kaydet
    joblib.dump(scaler, scaler_save_path)
    print(f"Scaler kaydedildi: {scaler_save_path}")

    # Label Encoder'ı kaydet
    joblib.dump(le, label_encoder_save_path)
    print(f"Label Encoder kaydedildi: {label_encoder_save_path}")

    # Class names JSON olarak kaydet
    with open(class_names_save_path, 'w') as f:
        json.dump(class_names, f, indent=4)
    print(f"Sınıf isimleri kaydedildi: {class_names_save_path}")

    print("\nİşlem tamamlandı!")

if __name__ == "__main__":
    main()

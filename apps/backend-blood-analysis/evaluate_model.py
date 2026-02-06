import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import json

# Dosya yolları
dataset_path = r"C:\Users\casper\OneDrive - comu.edu.tr\Masaüstü\diagnosed_cbc_data_v4.csv"
model_path = "blood_analysis_model.h5"
scaler_path = "scaler.pkl"
label_encoder_path = "label_encoder.pkl"

def main():
    # Veri Yükleme ve Ön İşleme (Aynı adımlar)
    try:
        df = pd.read_csv(dataset_path)
    except FileNotFoundError:
        print("Dataset bulunamadı.")
        return

    df = df[(df['HCT'] <= 60) & (df['HGB'] >= 2)]
    X = df.drop('Diagnosis', axis=1)
    y = df['Diagnosis']

    # Label Encoding (Yeniden fit ediyoruz çünkü split random state aynı olursa setler aynı olur)
    # Ancak scaler ve encoder'ı yüklemek daha doğru olurdu ama train/test split'i tekrar oluşturmak için
    # tüm veriyi işlememiz lazım.
    # En doğrusu: Kaydedilen scaler/encoder'ı kullanmak.
    
    le = joblib.load(label_encoder_path)
    y_encoded = le.transform(y)
    
    scaler = joblib.load(scaler_path)
    X_scaled = scaler.transform(X)

    # Train/Test Split (Aynı random_state ile)
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42)

    # Modeli Yükle
    model = tf.keras.models.load_model(model_path)

    # Değerlendirme
    loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"ACCURACY:{accuracy:.4f}")
    
    # Dosyaya da yazalım garanti olsun
    with open("accuracy_result.txt", "w") as f:
        f.write(f"{accuracy:.4f}")

if __name__ == "__main__":
    main()

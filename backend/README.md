# KRUSHAK BANI (କୃଷକ ବାଣୀ) - BACKEND & ML ARCHITECTURE

## Technology Stack
- **Framework**: Python 3.10+ & FastAPI
- **Deep Learning**: PyTorch (`torch`, `torchvision`), MobileNetV2 architecture
- **Dataset**: PlantVillage (Kaggle) fine-tuned for Rice (Odisha varieties), Tomato, Brinjal, Groundnut
- **Weather API**: Open-Meteo (Real-time precipitation probability, wind speed, temperature)
- **Database**: SQLite (`krushak_spray_log.db`) for Spray Log persistence
- **Telephony Webhooks**: Exotel / Twilio RESTful webhooks for Missed Call & DTMF voice callback

---

## Google Colab Model Training Guide (Crop Doctor)
To train or update the MobileNetV2 model:
1. Open Google Colab and set Runtime to GPU (T4).
2. Download PlantVillage dataset or Kaggle Rice Disease dataset:
```python
!pip install kaggle torchvision torch
# Download dataset
from torchvision import datasets, models, transforms
import torch
import torch.nn as nn
import torch.optim as optim

# Data augmentation
data_transforms = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

dataset = datasets.ImageFolder('path/to/dataset', transform=data_transforms)
dataloader = torch.utils.data.DataLoader(dataset, batch_size=32, shuffle=True)

# Load pretrained MobileNetV2 and replace last linear classifier
model = models.mobilenet_v2(pretrained=True)
num_ftrs = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_ftrs, 6) # Number of crop disease classes

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.0001)

# Train for 5-10 epochs
for epoch in range(5):
    for inputs, labels in dataloader:
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

# Save model file
torch.save(model.state_dict(), 'crop_mobilenet_v2.pth')
```
3. Place `crop_mobilenet_v2.pth` inside this `backend/` folder.

---

## Running the FastAPI Server Locally
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Open interactive Swagger UI at: `http://localhost:8000/docs`

---

## Router Structure
- `main.py`: Entry point, CORS setup, router registration
- `advisor.py`:
  - `/advisor/pesticide`: OUAT dose calculation + Open-Meteo rain & wind check
  - `/advisor/water`: Irrigation interval checking + rain prediction
  - `/advisor/fertiliser`: Basal/tillering/panicle doses + Soil Health Card NPK adjustments
  - `/advisor/crop-stress`: Questionnaire rule engine
- `crop_doctor.py`: Image upload & classification with confidence threshold (<0.65 -> 'not sure')
- `spray_log.py`: SQLite spray logging, minimum gap check (<7 days warning), safety trigger
- `labour.py`: Custom Hiring Centres (CHC), drones, sprayers by district with `<a href="tel:">`
- `rotation.py`: Agro-climatic crop rotation recommendations
- `ivr_webhook.py`: Missed call callback & DTMF voice response handlers

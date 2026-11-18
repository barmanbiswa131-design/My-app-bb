# NOVA learning and training

NOVA uses a pretrained multilingual base model plus a small LoRA adapter. This is real parameter fine-tuning: it changes adapter weights, not the whole base model.

## 1. Prepare examples
Edit `data/train.jsonl`. Each line must be one JSON object:
`{"user":"...","assistant":"..."}`
Use original, accurate, reviewed Bengali, Banglish, Hindi and Hinglish examples. Do not put passwords, private chats, personal data, or unverified copied web text into training data.

## 2. Train
A GPU runtime such as a compatible Colab session is recommended. In the repository root:
```bash
pip install -r training/requirements.txt
python training/train_lora.py --data training/data/train.jsonl --output training/output/nova-lora --epochs 2
```
The script saves a LoRA adapter. Upload the resulting adapter folder to a model host or storage that your backend can access, then set `NOVA_ADAPTER_PATH` in the backend environment.

## 3. Internet learning is a separate step
Downloading web pages does not automatically teach the model. Web information must be gathered from permitted sources, checked for accuracy and licensing, converted into useful original examples, reviewed, and then used in a training run. For frequently changing facts, retrieval/search is usually better than fine-tuning.

## 4. Safety and quality gate
Do not automatically train on every page NOVA finds. Keep a reviewed dataset, run test questions in both scripts and languages, compare the new adapter with the previous version, and deploy only if answers improve. The current starter dataset is intentionally small and is only a smoke-test seed, not enough to make NOVA broadly knowledgeable.

## Resource note
GitHub Pages cannot train or serve this model. Training needs a separate compute session, usually with a GPU. Free GPU availability is temporary and not guaranteed; this setup does not train continuously in the background.

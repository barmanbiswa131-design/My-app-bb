import os
from typing import List, Literal, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

MODEL_ID = os.getenv("NOVA_MODEL_ID", "Qwen/Qwen2.5-0.5B-Instruct")
ADAPTER_PATH = os.getenv("NOVA_ADAPTER_PATH", "").strip()
MAX_NEW_TOKENS = int(os.getenv("NOVA_MAX_NEW_TOKENS", "180"))

app = FastAPI(title="NOVA 2.0 API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("NOVA_ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

tokenizer = None
model = None
device = "cuda" if torch.cuda.is_available() else "cpu"

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=3000)

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1200)
    history: List[Message] = Field(default_factory=list, max_length=12)

@app.on_event("startup")
def load_model():
    global tokenizer, model
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    dtype = torch.float16 if device == "cuda" else torch.float32
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID, torch_dtype=dtype, low_cpu_mem_usage=True
    )
    if ADAPTER_PATH:
        model = PeftModel.from_pretrained(model, ADAPTER_PATH)
    model.to(device)
    model.eval()

@app.get("/health")
def health():
    return {"status": "ok" if model is not None else "loading",
            "model": MODEL_ID, "adapter": bool(ADAPTER_PATH), "device": device}

@app.post("/chat")
def chat(req: ChatRequest):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="NOVA model is still loading")
    messages = [{
        "role": "system",
        "content": (
            "You are NOVA, a helpful and friendly AI assistant. "
            "Reply naturally and concisely. Understand Bengali, Banglish, Hindi "
            "and Hinglish. Reply in the language and script the user uses. "
            "Do not pretend to be human or claim experiences you do not have. "
            "If unsure, say so clearly."
        )
    }]
    for item in req.history[-8:]:
        messages.append({"role": item.role, "content": item.content})
    messages.append({"role": "user", "content": req.message})
    prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    with torch.inference_mode():
        output = model.generate(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.08,
            pad_token_id=tokenizer.eos_token_id,
        )
    answer_tokens = output[0][inputs["input_ids"].shape[1]:]
    answer = tokenizer.decode(answer_tokens, skip_special_tokens=True).strip()
    return {"reply": answer or "একটু অন্যভাবে বলবে? আমি বুঝতে পারিনি।"}

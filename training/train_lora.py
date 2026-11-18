"""Fine-tune a small NOVA adapter from reviewed JSONL conversation examples.

Each JSONL row: {"user": "...", "assistant": "..."}
This updates a LoRA adapter, not the pretrained model's full weights.
"""
import argparse
import json
import os
from pathlib import Path

import torch
from datasets import Dataset
from peft import LoraConfig, get_peft_model, TaskType
from transformers import (
    AutoModelForCausalLM, AutoTokenizer, Trainer,
    TrainingArguments, DataCollatorForLanguageModeling
)

BASE_MODEL = os.getenv("NOVA_MODEL_ID", "Qwen/Qwen2.5-0.5B-Instruct")

def load_rows(path):
    rows = []
    with open(path, "r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, 1):
            if not line.strip():
                continue
            item = json.loads(line)
            if not isinstance(item.get("user"), str) or not isinstance(item.get("assistant"), str):
                raise ValueError(f"Line {line_no}: expected user and assistant strings")
            if item["user"].strip() and item["assistant"].strip():
                rows.append(item)
    if not rows:
        raise ValueError("Training file is empty. Add reviewed examples first.")
    return rows

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="training/data/train.jsonl")
    parser.add_argument("--output", default="training/output/nova-lora")
    parser.add_argument("--epochs", type=int, default=2)
    parser.add_argument("--max-length", type=int, default=512)
    args = parser.parse_args()

    rows = load_rows(args.data)
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    def encode(item):
        messages = [
            {"role": "system", "content": "You are NOVA. Reply naturally and helpfully in Bengali, Banglish, Hindi or Hinglish, matching the user's language."},
            {"role": "user", "content": item["user"]},
            {"role": "assistant", "content": item["assistant"]},
        ]
        text = tokenizer.apply_chat_template(messages, tokenize=False)
        result = tokenizer(text, truncation=True, max_length=args.max_length)
        result["labels"] = result["input_ids"].copy()
        return result

    dataset = Dataset.from_list(rows).map(encode, remove_columns=["user", "assistant"])
    use_cuda = torch.cuda.is_available()
    dtype = torch.float16 if use_cuda else torch.float32
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL, torch_dtype=dtype, low_cpu_mem_usage=True
    )
    model.config.use_cache = False
    if use_cuda:
        model.gradient_checkpointing_enable()

    config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=8, lora_alpha=16, lora_dropout=0.05,
        target_modules=["q_proj", "v_proj"],
        bias="none",
    )
    model = get_peft_model(model, config)
    model.print_trainable_parameters()

    training_args = TrainingArguments(
        output_dir=args.output,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=8,
        learning_rate=2e-4,
        logging_steps=5,
        save_strategy="epoch",
        fp16=use_cuda,
        report_to="none",
        remove_unused_columns=False,
    )
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False),
    )
    trainer.train()
    Path(args.output).mkdir(parents=True, exist_ok=True)
    model.save_pretrained(args.output)
    tokenizer.save_pretrained(args.output)
    print(f"Saved NOVA LoRA adapter to: {args.output}")

if __name__ == "__main__":
    main()

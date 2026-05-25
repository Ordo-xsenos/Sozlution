#!/bin/bash

# Скрипт для инициализации Ollama и загрузки модели gemma

echo "Waiting for Ollama to start..."
sleep 5

# Проверяем, загружена ли модель qwen2.5:3b
if ! ollama list | grep -q "qwen2.5:3b"; then
    echo "Pulling qwen2.5:3b model..."
    ollama pull qwen2.5:3b
    echo "Qwen2.5:3B model downloaded successfully!"
else
    echo "Qwen2.5:3B model already exists."
fi

echo "Ollama initialization complete."

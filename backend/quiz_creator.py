import json
from agents import AsyncOpenAI, Agent, OpenAIChatCompletionsModel, Runner
import re

client = AsyncOpenAI(
    base_url="https://api.cerebras.ai/v1",
    api_key="csk-pvenfxvkwc5mpvv992dp4959hhnx2k85x8jwjxpm9xtw24ry"
)

instructions = """
    You are a data creator. Create 5 general knowledge questions. Each question must have:

    - A unique "num" field continuing from the existing questions (starting from 1),
    - A "question" string,
    - An "answers" list with exactly 4 options,
    - One "correctAnswer" that matches one of the options.

    The output should be a Python list of dictionaries following the same format as below:

    [
        {
            "num": 1,
            "question": "What is the capital of France?",
            "answers": ["Paris", "London", "Berlin", "Madrid"],
            "correctAnswer": "Paris"
        },
        ...
    ]

    Do not repeat existing questions. Provide only 5 questions in the output.
"""
agent = Agent(
    name = "python-agent",
    instructions= instructions,
    model = OpenAIChatCompletionsModel(
        model = "qwen-3-32b",
        openai_client = client,
    )
)

async def generate_questions():
    result = await Runner.run(agent, "Help me create 5 general knowledge questions. Output only the array list.")
    print(result.final_output)  # Debugging line to see the raw output
    raw_output = result.final_output.strip()
    clean_output = re.sub(r"<think>.*?</think>\s*", "", raw_output, flags=re.DOTALL)

    try:
        return json.loads(clean_output)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Invalid JSON from agent: {e}\nOutput:\n{clean_output}")
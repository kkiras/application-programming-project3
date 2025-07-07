import json
from agents import AsyncOpenAI, Agent, OpenAIChatCompletionsModel, Runner
import re

client = AsyncOpenAI(
    base_url="https://api.cerebras.ai/v1",
    api_key="csk-pvenfxvkwc5mpvv992dp4959hhnx2k85x8jwjxpm9xtw24ry"
)

instructions = """
    You are a data creator. Create 5 software engineering questions. The questions must be of two types:

    True/False questions – the "answers" list must contain exactly two options: ["True", "False"].

    Multiple choice questions – the "answers" list must contain exactly 4 unique options.

    Each question must include:

    A unique "num" field continuing from the existing questions (starting from 1),

    A "question" string related to software engineering concepts,

    An "answers" list (with either 2 or 4 options depending on the type),

    A "correctAnswer" that must match one of the options in the "answers" list.

    The output must be a Python list of dictionaries following the format below:

    [
        {
            "num": 1,
            "question": "What does 'OOP' stand for in software development?",
            "answers": ["Object-Oriented Programming", "Operational Output Processing", "Optional Object Protocol", "Ordered Operation Procedure"],
            "correctAnswer": "Object-Oriented Programming"
        },
        ...
    ]

    Do not repeat existing questions. Provide exactly 5 questions, a mix of True/False and Multiple Choice formats, and nothing else in the output.
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
    result = await Runner.run(agent, "Help me create 5 general questions. Output only the array list.")
    print(result.final_output)  # Debugging line to see the raw output
    raw_output = result.final_output.strip()
    clean_output = re.sub(r"<think>.*?</think>\s*", "", raw_output, flags=re.DOTALL)

    try:
        return json.loads(clean_output)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Invalid JSON from agent: {e}\nOutput:\n{clean_output}")
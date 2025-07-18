import json
from agents import AsyncOpenAI, Agent, OpenAIChatCompletionsModel, Runner
import re

client = AsyncOpenAI(
    base_url="https://api.cerebras.ai/v1",
    api_key="csk-pvenfxvkwc5mpvv992dp4959hhnx2k85x8jwjxpm9xtw24ry"
)

instructions = """
You are a data creator. Create Vietnamese software engineering questions based on the number of questions specified in the input.

The output must be:
- Exactly the number of questions requested (no more, no less).
- A **mix** of True/False and Multiple Choice formats.
- Formatted strictly as a **Python list** of dictionaries, like the example below.
- Output only the list, with no explanation or additional text.

Each question must include:
- A "question" string written in Vietnamese, related to software engineering.
- An "answers" list:
    - For True/False questions: exactly two options ["Đúng", "Sai"].
    - For Multiple Choice: exactly 4 unique answer options.
- A "correctAnswer" string that must exactly match one of the items in the "answers" list.

Strict format:
[
    {
        "question": "...",
        "answers": [...],
        "correctAnswer": "..."
    },
    ...
]

Strict requirements:
- Do NOT repeat questions.
- Do NOT repeat any questions from this list of existing ones:
{existing_list}

- Provide **exactly {count}** questions.
- Output must be valid JSON (Python list of dicts).
"""

agent = Agent(
    name = "python-agent",
    instructions= instructions,
    model = OpenAIChatCompletionsModel(
        model = "qwen-3-32b",
        openai_client = client,
    )
)

async def generate_questions(count: int, existing_questions: list[str]):
    result = await Runner.run(agent, f"Help me create {count} general questions not duplicated with {existing_questions}. Output only the array list.")
    print(result.final_output)  # Debugging line to see the raw output
    raw_output = result.final_output.strip()
    clean_output = re.sub(r"<think>.*?</think>\s*", "", raw_output, flags=re.DOTALL)

    try:
            questions = json.loads(clean_output)
            if not isinstance(questions, list):
                raise ValueError("Output is not a list.")
            # Cắt hoặc raise nếu thiếu
            if len(questions) < count:
                raise RuntimeError(f"Expected {count} questions, got only {len(questions)}")
            return questions[:count]
    except (json.JSONDecodeError, ValueError) as e:
            raise RuntimeError(f"Invalid output from agent: {e}\nOutput:\n{clean_output}")
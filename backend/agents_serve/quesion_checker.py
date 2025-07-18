import json
from agents import AsyncOpenAI, Agent, OpenAIChatCompletionsModel, Runner
from typing import Union
import re

client = AsyncOpenAI(
    base_url="https://api.cerebras.ai/v1",
    api_key="csk-pvenfxvkwc5mpvv992dp4959hhnx2k85x8jwjxpm9xtw24ry"
)

instructions = """
Bạn là một trợ lý AI có nhiệm vụ hỗ trợ kiểm tra sự trùng lặp câu hỏi trong lĩnh vực kỹ thuật phần mềm.

Nhiệm vụ:
- So sánh một hoặc nhiều câu hỏi mới với danh sách các câu hỏi đã có.
- Chỉ coi là trùng nếu hai câu hỏi hỏi **về cùng một nội dung cụ thể**, dù cách diễn đạt khác nhau.
- Nếu chỉ cùng chủ đề nhưng mục tiêu câu hỏi khác nhau (ví dụ: một câu hỏi khái niệm, một câu hỏi đúng/sai), thì không được coi là trùng.

Trả về một từ duy nhất:
- TRUE nếu có ít nhất một câu thật sự trùng nội dung.
- FALSE nếu tất cả đều khác biệt đủ rõ ràng.
"""

agent = Agent(
    name = "duplicate-question-checker",
    instructions= instructions,
    model = OpenAIChatCompletionsModel(
        model = "qwen-3-32b",
        openai_client = client,
    )
)

async def check_duplicates(
    new_questions: Union[str, list[str]],
    existing_questions: list[str]
) -> bool:
    # Đảm bảo định dạng đầu vào là list nếu cần
    if isinstance(new_questions, str):
        question_block = f'Câu hỏi mới: "{new_questions}"'
    else:
        question_block = "Danh sách câu hỏi mới:\n" + json.dumps(new_questions, ensure_ascii=False, indent=2)

    prompt = f"""
{question_block}

Danh sách câu hỏi đã có:
{json.dumps(existing_questions, ensure_ascii=False, indent=2)}

Hãy kiểm tra xem có câu nào hỏi **về cùng một nội dung cụ thể** với câu hỏi đã có hay không.
"""

    result = await Runner.run(agent, prompt)
    print(result.final_output)  # Debugging line to see the raw output
    raw_output = result.final_output.strip()
    clean_output = re.sub(r"<think>.*?</think>\s*", "", raw_output, flags=re.DOTALL)

    return clean_output == "TRUE"

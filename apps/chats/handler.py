import logging
import json

from agent import CustomAgentExecutor
from pinecone_client import final_answer, init_embedding_and_pinecone, init_vectorstore, semantic_search
from helper import convert_history, load_and_set_api_keys
from langchain_openai import ChatOpenAI

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.base import RunnableSerializable
from langchain_core.messages import ToolMessage

logger = logging.getLogger()
logger.setLevel(logging.INFO)

tools = [semantic_search]


prompt = ChatPromptTemplate.from_messages([
    ("system", """\
You are a helpful assistant that answers user questions by using tools.

**Important:**

- You must NEVER call the tool named "final_answer" on the very first step.
- Always call at least one other tool before calling "final_answer".
- If you try to call "final_answer" first, reject this action and pick a different tool.

Your workflow:

1. Use retrieval or processing tools to gather information.
2. After gathering information, call "final_answer" exactly once with the final answer and tools used.

Scratchpad will contain JSON arrays "contents" and "metadata" from previous tools.

Do NOT call "final_answer" first. If you want to give an answer, you need to retrieve information first.
"""),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])


def lambda_handler(event, context):
    print(event)

    user_id = event["userId"]
    knowledge_room_id = event["knowledgeRoomId"]

    load_and_set_api_keys()
    init_embedding_and_pinecone()
    init_vectorstore(f"{user_id}_{knowledge_room_id}")

    message = event['message']
    history_raw = event.get("history", [])
    chat_history = convert_history(history_raw)

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    tools = [final_answer, semantic_search]

    executor = CustomAgentExecutor(prompt=prompt, llm=llm, tools=tools, chat_history=chat_history)
    result = executor.invoke(message)

    if isinstance(result, str):
        try:
            result_dict = json.loads(result)
        except json.JSONDecodeError as e:
            print(f"Error decoding result JSON string: {e}")
            raise
    elif isinstance(result, dict):
        result_dict = result
    else:
        raise TypeError(f"Unexpected result type: {type(result)}")

    if "metadata" in result_dict and isinstance(result_dict["metadata"], list):
        try:
            result_dict["metadata"] = [
                json.loads(m) if isinstance(m, str) else m for m in result_dict["metadata"]
            ]
        except json.JSONDecodeError as e:
            print(f"Error decoding metadata items: {e}")
            raise

    return result_dict

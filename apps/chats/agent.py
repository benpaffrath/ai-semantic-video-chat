import json
from langchain_core.messages import ToolMessage, BaseMessage
from langchain_core.runnables.base import RunnableSerializable

class CustomAgentExecutor:
    def __init__(
        self,
        prompt,
        llm,
        tools: list,
        max_iterations: int = 3,
        chat_history: list[BaseMessage] = None,

    ):
        self.chat_history = chat_history or []
        self.max_iterations = max_iterations
        self.name2tool = {tool.name: tool.func for tool in tools}

        if "final_answer" not in self.name2tool:
            raise ValueError("Missing required tool: 'final_answer'")

        self.agent: RunnableSerializable = (
            {
                "input": lambda x: x["input"],
                "chat_history": lambda x: x["chat_history"],
                "agent_scratchpad": lambda x: x.get("agent_scratchpad", [])
            }
            | prompt
            | llm.bind_tools(tools, tool_choice="any")
        )

    def invoke(self, input: str) -> dict:
        count = 0
        agent_scratchpad = []

        while count < self.max_iterations:
            # Step 1: Agent generates tool call
            tool_call = self.agent.invoke({
                "input": input,
                "chat_history": self.chat_history,
                "agent_scratchpad": agent_scratchpad
            })

            print(f"\n[{count}] Tool Call: {tool_call.tool_calls[0]['name']}")

            agent_scratchpad.append(tool_call)

            # Step 2: Execute the tool
            tool_name = tool_call.tool_calls[0]["name"]
            tool_args = tool_call.tool_calls[0]["args"]
            tool_call_id = tool_call.tool_calls[0]["id"]

            tool_out = self.name2tool[tool_name](**tool_args)

            # Step 3: Create ToolMessage with serialized output
            tool_exec = ToolMessage(
                content=json.dumps(tool_out),
                tool_call_id=tool_call_id
            )
            agent_scratchpad.append(tool_exec)

            # Optional debug output
            print(f"→ Executed {tool_name} with args {tool_args}")
            print(f"→ Output: {tool_out}")

            # Step 4: Break if final answer is returned
            if tool_name == "final_answer":
                break

            count += 1

        return tool_out

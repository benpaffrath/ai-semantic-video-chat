"""
Custom Agent Executor Module

This module provides a custom implementation of an agent executor that manages
LLM-based tool calls. It implements a flexible agent system that can execute
multiple tools in sequence until a final answer is generated.

The main component is the CustomAgentExecutor class, which:
- Manages tool execution based on LLM decisions
- Maintains chat history and agent scratchpad
- Handles iterative tool calling with configurable limits
- Provides a clean interface for agent-based interactions

Example:
    from langchain_core.messages import BaseMessage
    from your_llm_module import YourLLM
    from your_tools_module import get_tools
    
    agent = CustomAgentExecutor(
        prompt=your_prompt,
        llm=YourLLM(),
        tools=get_tools()
    )
    
    result = agent.invoke("What is the weather like today?")

Dependencies:
    - langchain_core.messages: For message handling
    - langchain_core.runnables.base: For runnable components
    - json: For serialization of tool outputs
"""

import json
from langchain_core.messages import ToolMessage, BaseMessage
from langchain_core.runnables.base import RunnableSerializable

class CustomAgentExecutor:
    """
    A custom agent executor that manages LLM-based tool calls.
    
    This class implements an agent that works with a Language Model (LLM)
    to execute tools based on user inputs. The agent can go through multiple
    iterations until it generates a final answer.
    
    Attributes:
        chat_history (list[BaseMessage]): History of chat messages
        max_iterations (int): Maximum number of tool calls
        name2tool (dict): Mapping of tool names to tool functions
        agent (RunnableSerializable): The configured agent with prompt and LLM
    """

    def __init__(
        self,
        prompt,
        llm,
        tools: list,
        chat_history: list[BaseMessage] = None,

    ):
        """
        Initialize the CustomAgentExecutor.
        
        Args:
            prompt: The prompt template for the agent
            llm: The language model for tool selection
            tools (list): List of available tools
            max_iterations (int, optional): Maximum number of iterations. Default: 3
            chat_history (list[BaseMessage], optional): Initial chat history. Default: []
            
        Raises:
            ValueError: If the required tool 'final_answer' is missing
        """
        self.chat_history = chat_history or []
        self.max_iterations = 3
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
        """
        Execute the agent with a user input.
        
        The agent goes through the following steps:
        1. Generates a tool call based on the input
        2. Executes the selected tool
        3. Adds the result to the scratchpad
        4. Repeats until final answer or max_iterations
        
        Args:
            input (str): The user input to be processed
            
        Returns:
            dict: The result of the last tool call (usually the final answer)
            
        Note:
            The agent automatically stops when the 'final_answer' tool is called
            or when the maximum number of iterations is reached.
        """
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

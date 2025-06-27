import boto3
import os
from typing import List, Dict
import logging
from botocore.exceptions import ClientError

logger = logging.getLogger()

dynamodb = boto3.client("dynamodb")

DDB_TABLE_NAME = os.environ["SEMANTIC_VIDEO_CHAT_TABLE_NAME"]

def chunk_transcript(
    transcript_segments: List[Dict[str, float | str]],
    chunk_size: int = 1000,
    chunk_overlap: int = 200
) -> List[Dict[str, float | str]]:
    """
    Splits transcript segments into chunks with specified chunk_size and chunk_overlap (in characters).
    
    Args:
        transcript_segments: List of dicts with keys 'text' (str), 'start' (float), 'end' (float)
        chunk_size: max characters per chunk
        chunk_overlap: characters to overlap between chunks
    
    Returns:
        List of dicts with keys:
          - 'text' (str): the chunk text
          - 'start' (float): start time of chunk
          - 'end' (float): end time of chunk
    """
    chunks: List[Dict[str, float | str]] = []
    current_chunk_text: str = ""
    current_chunk_start: float | None = None
    current_chunk_end: float | None = None
    
    i = 0
    n = len(transcript_segments)
    
    while i < n:
        segment = transcript_segments[i]
        segment_text = segment["text"]
        
        if current_chunk_start is None:
            current_chunk_start = segment["start"] 
        
        current_chunk_text += segment_text + " "
        current_chunk_end = segment["end"] 
        
        if len(current_chunk_text) >= chunk_size:
            chunks.append({
                "text": current_chunk_text.strip(),
                "start": current_chunk_start,
                "end": current_chunk_end,    
            })
            
            # Overlap text for next chunk
            overlap_text = current_chunk_text[-chunk_overlap:]
            current_chunk_text = overlap_text
            current_chunk_start = current_chunk_end - 1 if current_chunk_end is not None else 0
            
        i += 1
    
    if current_chunk_text.strip():
        chunks.append({
            "text": current_chunk_text.strip(),
            "start": current_chunk_start if current_chunk_start is not None else 0,
            "end": current_chunk_end if current_chunk_end is not None else 0,
        })
    
    return chunks

def update_video_status(knowledge_room_id: str, video_id: str, new_status: str) -> dict:
    """
    Updates the video status in DynamoDB.
    """
    try:
        return dynamodb.update_item(
            TableName=DDB_TABLE_NAME,
            Key={
                "PK": {"S": f"ROOM#{knowledge_room_id}"},
                "SK": {"S": f"VIDEO#{video_id}"}
            },
            UpdateExpression="SET metadata.#status = :new_status",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={":new_status": {"S": new_status}}
        )
    except ClientError as e:
        logger.error(f"Error updating video status: {e}")
        raise

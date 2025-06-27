import json
import logging
import os
from helper import download_from_s3, extract_audio, replace_extension, send_to_sqs, success_response, error_response, transcribe_audio, update_video_status

logger = logging.getLogger()
logger.setLevel(logging.INFO)

S3_BUCKET_NAME = os.environ.get("S3_VIDEO_BUCKET_NAME")

def lambda_handler(event, context=None):
    """
    AWS Lambda handler to process video-to-audio extraction from S3 objects.
    """
    logger.info("Received event: %s", json.dumps(event))

    for record in event.get("Records", []):
        try:
            body = json.loads(record["body"])
            video_id = body["id"]
            knowledge_room_id = body["knowledgeRoomId"]
            video_key = body["videoKey"]
            user_id = body["userId"]

            s3_key = f"{user_id}/{video_key}"
            input_path = f"/tmp/{os.path.basename(s3_key)}"
            output_path = replace_extension(input_path, ".mp3")

            # 1. Download video file from s3 to tmp directory
            download_from_s3(S3_BUCKET_NAME, s3_key, input_path)

            # 2. Extract the audio of the video and store it as file
            extract_audio(input_path, output_path)

            # 3. Create transcription of the audio
            transcript = transcribe_audio(output_path)

            # 4. Update the video status in the databae
            update_video_status(knowledge_room_id=knowledge_room_id, video_id=video_id, new_status="EMBEDDINGS_CREATING")

            # 5. Send SQS event to queue for further processing
            messageId = send_to_sqs({
                "userId": user_id,
                "videoId": video_id,
                "videoKey": video_key,
                "knowledgeRoomId": knowledge_room_id,
                "transcript": transcript
            })

            return success_response({'messageId': messageId})

        except Exception as e:
            logger.error("Error processing record: %s", str(e))
            return error_response(str(e))

    return success_response({'message': 'No records processed'})

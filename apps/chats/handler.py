import time

def lambda_handler(event, context):
    time.sleep(3)

    return {
        'content': 'Hello from Chat Lambda!'
    }

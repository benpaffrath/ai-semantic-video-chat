# Transcription Service

This directory contains the code for the transcription service of the AI Semantic Video Chat project. The service is responsible for processing audio or video files and generating transcriptions, which can then be used for further semantic analysis and chat functionalities.

## Structure

- `handler.py`: Main entry point for handling transcription jobs. This file contains the logic to receive transcription requests, process them, and return the results.
- `helper.py`: Contains utility functions and helper classes used by the transcription service, such as audio/video processing, file handling, and integration with external services.
- `requirements.txt`: Lists the Python dependencies required to run the transcription service.
- `Makefile`: Provides common commands for building, testing, and deploying the transcription service.
- `dist/`: (Optional) Directory for build artifacts or distribution packages.
- `package/`: (Optional) Directory for Python package source code or additional modules.

## Usage

1. **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
2. **Run the service:**
   The main logic is in `handler.py`. You can run or import this file depending on your deployment setup (e.g., as a Lambda function or a standalone script).

3. **Development:**
   Use the `Makefile` for common development tasks, such as linting, testing, or packaging.

## Purpose

The transcription service is designed to:

- Convert audio or video files into text transcriptions.
- Support downstream semantic search and chat functionalities by providing accurate and timely transcriptions.
- Integrate with other components of the AI Semantic Video Chat platform.
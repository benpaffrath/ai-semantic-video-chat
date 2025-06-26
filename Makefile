FRONTEND_DIR=apps/frontend
GRAPHQL_DIR=apps/graphql
EMBEDDINGS_DIR=apps/embeddings
TRANSCRIPTIONS_DIR=apps/transcription
CHATS_DIR=apps/chats
FFMPEG_LAYER_DIR=shared/layers/ffmpeg
LANGCHAIN_LAYER_DIR=shared/layers/langchain

.PHONY: install-frontend dev build start lint-frontend clean \
        install-lambda lint-lambda test-lambda clean-lambda \
        all install lint clean

## === Frontend (Next.js) ===

install-frontend:
	cd $(FRONTEND_DIR) && npm install

lint-frontend:
	cd $(FRONTEND_DIR) && npm run lint

build-frontend:
	cd $(FRONTEND_DIR) && npm run build

clean-frontend:
	rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist $(FRONTEND_DIR)/.next

## === GrqphQL Lambda (Node.js) ===

install-graphql:
	$(MAKE) -C $(GRAPHQL_DIR) install

build-graphql:
	$(MAKE) -C $(GRAPHQL_DIR) build

package-graphql:
	$(MAKE) -C $(GRAPHQL_DIR) package

clean-graphql:
	$(MAKE) -C $(GRAPHQL_DIR) clean	

## === Transcription Lambda (Python) ===

install-transcription:
	$(MAKE) -C $(TRANSCRIPTIONS_DIR) install

package-transcription:
	$(MAKE) -C $(TRANSCRIPTIONS_DIR) package

clean-transcription:
	$(MAKE) -C $(TRANSCRIPTIONS_DIR) clean	

## === Embeddings Lambda (Python) ===

install-embeddings:
	$(MAKE) -C $(EMBEDDINGS_DIR) install

package-embeddings:
	$(MAKE) -C $(EMBEDDINGS_DIR) package

clean-embeddings:
	$(MAKE) -C $(EMBEDDINGS_DIR) clean

## === Chats Lambda (Python) ===

install-chats:
	$(MAKE) -C $(CHATS_DIR) install

package-chats:
	$(MAKE) -C $(CHATS_DIR) package

clean-chats:
	$(MAKE) -C $(CHATS_DIR) clean

## === LangChain Layer ===

install-langchain-layer:
	$(MAKE) -C $(LANGCHAIN_LAYER_DIR) install

docker-install-langchain-layer:
	$(MAKE) -C $(LANGCHAIN_LAYER_DIR) docker-install

package-langchain-layer:
	$(MAKE) -C $(LANGCHAIN_LAYER_DIR) package

clean-langchain-layer:
	$(MAKE) -C $(LANGCHAIN_LAYER_DIR) clean

## === ffmpeg Layer ===

package-ffmpeg-layer:
	$(MAKE) -C $(FFMPEG_LAYER_DIR) package

clean-ffmpeg-layer:
	$(MAKE) -C $(FFMPEG_LAYER_DIR) clean		

## === Aliases ===

clean: clean-frontend clean-graphql clean-transcription clean-embeddings clean-chats clean-langchain-layer clean-ffmpeg-layer

install: install-frontend install-graphql install-transcription install-embeddings install-chats docker-install-langchain-layer

lint: lint-frontend

build: build-frontend build-graphql

package: package-graphql package-transcription package-embeddings package-chats package-langchain-layer package-ffmpeg-layer

all: clean install lint build package

all-except-frontend-build: clean install lint build-graphql package

LAMBDA_PACKAGE_DIR=python
LAMBDA_DIST_DIR=dist
LAMBDA_ZIP=$(LAMBDA_DIST_DIR)/layer.zip
PYTHON_VERSION=3.11
DOCKER_IMAGE=python:3.11-slim

.PHONY: install docker-install package clean

install:
	mkdir -p $(LAMBDA_PACKAGE_DIR)/lib/python$(PYTHON_VERSION)/site-packages
	pip install -r requirements.txt -t $(LAMBDA_PACKAGE_DIR)/lib/python$(PYTHON_VERSION)/site-packages

docker-install:
	docker run --rm --platform linux/amd64 \
		-v $(shell pwd):/var/task \
		-w /var/task $(DOCKER_IMAGE) \
		bash -c "\
		mkdir -p $(LAMBDA_PACKAGE_DIR)/lib/python$(PYTHON_VERSION)/site-packages && \
		pip install --upgrade pip && \
		pip install --platform manylinux2014_x86_64 \
		            --only-binary=:all: \
		            --implementation cp \
		            --python-version $(PYTHON_VERSION) \
		            --target $(LAMBDA_PACKAGE_DIR)/lib/python$(PYTHON_VERSION)/site-packages \
		            -r requirements.txt"

package: $(LAMBDA_DIST_DIR)
	zip -r $(LAMBDA_ZIP) $(LAMBDA_PACKAGE_DIR)

clean:
	rm -rf $(LAMBDA_PACKAGE_DIR) $(LAMBDA_DIST_DIR)

$(LAMBDA_DIST_DIR):
	mkdir -p $(LAMBDA_DIST_DIR)

make all: clean docker-install package
LAMBDA_PACKAGE_DIR=package
LAMBDA_DIST_DIR=dist
LAMBDA_ZIP=$(LAMBDA_DIST_DIR)/lambda.zip
PYTHON_VERSION=3.11
DOCKER_IMAGE=python:$(PYTHON_VERSION)-slim

.PHONY: install docker-install package clean

install:
	pip install -r requirements.txt --target $(LAMBDA_PACKAGE_DIR)

docker-install:
	docker run --rm --platform linux/amd64 -v $(shell pwd):/var/task -w /var/task $(DOCKER_IMAGE) bash -c "\
		pip install -r requirements.txt --no-deps --target $(LAMBDA_PACKAGE_DIR)"

package: $(LAMBDA_DIST_DIR)
	cd $(LAMBDA_PACKAGE_DIR) && zip -r ../$(LAMBDA_ZIP) .
	zip -g $(LAMBDA_ZIP) *.py

clean:
	rm -rf $(LAMBDA_PACKAGE_DIR) $(LAMBDA_DIST_DIR)

$(LAMBDA_DIST_DIR):
	mkdir -p $(LAMBDA_DIST_DIR)

all: clean docker-install package
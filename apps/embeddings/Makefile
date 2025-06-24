LAMBDA_PACKAGE_DIR=package
LAMBDA_DIST_DIR=dist
LAMBDA_ZIP=$(LAMBDA_DIST_DIR)/lambda.zip

.PHONY: install package clean

install:
	pip install -r requirements.txt --target $(LAMBDA_PACKAGE_DIR)

package: $(LAMBDA_DIST_DIR)
	cd $(LAMBDA_PACKAGE_DIR) && zip -r ../$(LAMBDA_ZIP) .
	zip -g $(LAMBDA_ZIP) *.py

clean:
	rm -rf $(LAMBDA_PACKAGE_DIR) $(LAMBDA_DIST_DIR)

$(LAMBDA_DIST_DIR):
	mkdir -p $(LAMBDA_DIST_DIR)

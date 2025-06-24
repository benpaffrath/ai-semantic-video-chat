LAMBDA_PACKAGE_DIR=package
LAMBDA_DIST_DIR=dist
LAMBDA_ZIP=$(LAMBDA_DIST_DIR)/layer.zip

.PHONY: install package clean

install:
	pip install -r requirements.txt --target $(LAMBDA_PACKAGE_DIR)

package: clean install | $(LAMBDA_DIST_DIR)
	cd $(LAMBDA_PACKAGE_DIR) && zip -r ../$(LAMBDA_ZIP) .

clean:
	rm -rf $(LAMBDA_PACKAGE_DIR) $(LAMBDA_DIST_DIR)

$(LAMBDA_DIST_DIR):
	mkdir -p $(LAMBDA_DIST_DIR)

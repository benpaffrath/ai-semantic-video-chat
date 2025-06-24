LAMBDA_DIST_DIR=dist
LAMBDA_ZIP=lambda.zip

.PHONY: install package clean

install:
	npm install

build:
	npm run build	

package: $(LAMBDA_DIST_DIR)
	cd $(LAMBDA_DIST_DIR) && zip -r $(LAMBDA_ZIP) .

clean:
	rm -rf node_modules $(LAMBDA_DIST_DIR)/$(LAMBDA_ZIP)

$(LAMBDA_DIST_DIR):
	mkdir -p $(LAMBDA_DIST_DIR)

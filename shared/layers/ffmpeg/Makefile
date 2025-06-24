LAMBDA_DIST_DIR=dist
LAMBDA_ZIP=$(LAMBDA_DIST_DIR)/layer.zip

.PHONY: package clean

package: $(LAMBDA_DIST_DIR)
	zip -r $(LAMBDA_ZIP) bin

clean:
	rm -rf $(LAMBDA_DIST_DIR)

$(LAMBDA_DIST_DIR):
	mkdir -p $(LAMBDA_DIST_DIR)

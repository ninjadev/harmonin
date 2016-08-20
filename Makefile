.PHONY: serve
serve:
	webpack-dev-server --progress --colors --host 0.0.0.0

.PHONY: clean
clean:
	rm compiled.js

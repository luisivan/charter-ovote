SHELL := /bin/bash
PROJECT_NAME=$(shell basename "$(PWD)")

.DEFAULT_GOAL := help
BROWSERIFY := $(PWD)/node_modules/.bin/browserify

BUILD_PATH := $(PWD)/dist

ENTRY_POINT_MAIN := $(PWD)/src/main.js
TARGET_BUNDLE_MAIN := $(BUILD_PATH)/main.js

#-----------------------------------------------------------------------
# HELP
#-----------------------------------------------------------------------

## help: Display this message

.PHONY: help
help:
	@echo
	@echo " Available targets on "$(PROJECT_NAME)":"
	@echo
	@sed -n 's/^##//p' Makefile | column -t -s ':' |  sed -e 's/^/ /'
	@echo

## init: Install the dependencies
.PHONY := init
init:
	npm install

#-----------------------------------------------------------------------
# RECIPES
#-----------------------------------------------------------------------

## main: Bundle the library
main: $(TARGET_BUNDLE_MAIN) package.json

## copy: Copy the artifacts to the UI project
copy: $(TARGET_BUNDLE_MAIN) package.json
	cp $(TARGET_BUNDLE_MAIN) ../plain-ui/static/main.js

$(TARGET_BUNDLE_MAIN): $(ENTRY_POINT_MAIN) package.json
	mkdir -p $(BUILD_PATH)
	$(BROWSERIFY) $< -o $@

## :
## clean: Cleanup the build folder

.PHONY := clean
clean: 
	rm -Rf $(BUILD_PATH)

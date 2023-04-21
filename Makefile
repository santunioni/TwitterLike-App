.PHONY: build setup

setup:
	npm install

infra/up:
	docker-compose up localstack mysql

format:
	npx prettier --write .

planetscale/migrations:
	npm run typeorm schema:drop
	npm run typeorm migration:run

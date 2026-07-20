commit:
	git commit -M ""

add:
	git add .

push:
	git push -u origin main

run:
	npm run dev

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down
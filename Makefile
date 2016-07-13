dbuild:
	npm install
	npm run clean
	MODE=prod npm run build
	npm run doc

	docker-compose -f docker-compose.yml build

	docker tag docker.shadoware.org/passprotect-server:1.0.0 docker.shadoware.org/passprotect-server:1
	docker tag docker.shadoware.org/passprotect-server:1.0.0 docker.shadoware.org/passprotect-server:1.0
	docker tag docker.shadoware.org/passprotect-server:1.0.0 docker.shadoware.org/passprotect-server:latest

	docker tag docker.shadoware.org/passprotect-client:1.0.0 docker.shadoware.org/passprotect-client:1
	docker tag docker.shadoware.org/passprotect-client:1.0.0 docker.shadoware.org/passprotect-client:1.0
	docker tag docker.shadoware.org/passprotect-client:1.0.0 docker.shadoware.org/passprotect-client:latest

dpush: dbuild
	docker push docker.shadoware.org/passprotect-server

drun: dbuild
	docker-compose up -d

mongodb:
	docker-compose up -d mongodb

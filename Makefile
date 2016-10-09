dbuild:
	npm install
	npm run clean
	PIWIK_SITE_URL='$${PIWIK_SITE_URL}' PIWIK_SITE_ID='$${PIWIK_SITE_ID}' MODE=prod npm run build
	npm run doc

	docker-compose -f docker-compose.yml build

	docker tag phoenix741/passprotect-server:develop phoenix741/passprotect-server:1
	docker tag phoenix741/passprotect-server:develop phoenix741/passprotect-server:1.1
	docker tag phoenix741/passprotect-server:develop phoenix741/passprotect-server:1.1.0
	docker tag phoenix741/passprotect-server:develop phoenix741/passprotect-server:latest

	docker tag phoenix741/passprotect-client:develop phoenix741/passprotect-client:1
	docker tag phoenix741/passprotect-client:develop phoenix741/passprotect-client:1.1
	docker tag phoenix741/passprotect-client:develop phoenix741/passprotect-client:1.1.0
	docker tag phoenix741/passprotect-client:develop phoenix741/passprotect-client:latest

dpush: dbuild
	docker push phoenix741/passprotect-server
	docker push phoenix741/passprotect-client

drun: dbuild
	docker-compose up -d

mongodb:
	docker-compose up -d mongodb

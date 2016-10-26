dbuild:
	npm install
	npm run clean
	PIWIK_SITE_URL='$${PIWIK_SITE_URL}' PIWIK_SITE_ID='$${PIWIK_SITE_ID}' MODE=prod npm run build
	npm run doc

	docker-compose -f docker-compose.yml build

dpush: dbuild
	docker push phoenix741/passprotect-server:develop
	docker push phoenix741/passprotect-client:develop

drun: dbuild
	docker-compose up -d

mongodb:
	docker-compose up -d mongodb

docker-compose stop

# Revert local changes
git checkout .
# Get latest version
git pull

mkdir -p backup

gitHash=$(git rev-parse --short HEAD)
gitTag=$(git describe --abbrev=0 --tags --always)

cat ./gitVersion.template | sed -e "s/_git_hash_/$gitHash/g" -e "s/_git_tag_/$gitTag/g" > ./frontend/src/gitVersion.js

cat ./frontend/src/gitVersion.js

docker-compose -f docker-compose.yaml -f docker-compose-monitoring.yaml  up --build
gitHash=$(git rev-parse --short HEAD)
gitTag=$(git describe --abbrev=0 --tags --always)

cat ./gitVersion.template | sed -e "s/_git_hash_/$gitHash/g" -e "s/_git_tag_/$gitTag/g" > ./frontend/src/gitVersion.js
$containerId=$args[0]
$file=$args[1]


write-host $file
write-host $containerId

docker cp $file "$($containerId):/tmp/"
docker exec -i $containerId /bin/bash -c "cat /tmp/$($file) | psql --username=user --dbname=iceHorseFair"
docker exec -i $containerId /bin/bash -c "rm /tmp/$($file)"

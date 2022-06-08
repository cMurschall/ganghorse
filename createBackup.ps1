$containerId=$args[0]
if(Test-Path backup.sql){
	Remove-Item backup.sql
}
docker exec -t $containerId pg_dumpall -c -l iceHorseFair -U user | out-file -append -encoding utf8 backup.sql

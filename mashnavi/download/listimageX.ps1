#
#
#
Write-Output "<imagefiles>"
Get-ChildItem catalog -recurse -name -include *.jpg,*.png -exclude *_*,*�R�s* | ForEach-Object {$_ -replace "\\", "/"} | ForEach-Object {Write-Output "`t<file name=`"catalog/$_`"/>"}
Write-Output "</imagefiles>"

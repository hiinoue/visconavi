#
Write-Output "<srcfiles>"
Get-ChildItem . -recurse -name -include *.html,*.js | ForEach-Object {$_ -replace "\\", "/"} | ForEach-Object {Write-Output "`t<file name=`"$_`"/>"}
Write-output "</srcfiles>"

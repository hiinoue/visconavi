#
#
#
$dirs = @() # ディレクトリ配列初期化
Write-Output "<srcfiles>"
Get-ChildItem . -recurse -name -include *.html,*.js | ForEach-Object {$dir = Split-Path $_ -Parent; if (-Not ($dirs -contains $dir)) {$dirs += $dir} ; $_ -replace "\\", "/"} | ForEach-Object {Write-Output "`t<file name=`"$_`"/>"}
foreach ($dir in $dirs)
{
	if ($dir -ne "") {
		$outdir = $dir -replace "\\", "/"
		Write-Output "`t<dir name=`"$outdir`"/>"
	}
}
Write-output "</srcfiles>"

#
$dirs = @()
Write-Output "{"
$files = Get-ChildItem . -recurse -name -include *.html,*.js -exclude html5*
$first = $true
$pgyo = ""
Write-Output "`t`"dir`": ["
foreach ($file in $files)
{
	$dir = Split-path $file -Parent
	if (("$dir" -ne "") -and (-Not ($dirs -contains $dir))) {
		$dirs += $dir
		if ($first) {
			$first = $false
		} else {
			Write-Output "${pgyo},"
		}
		$outdir = $dir -replace "\\", "/"
		$pgyo = "`t`t`"$outdir`""
	}
}
if ($pgyo -ne "") {
	Write-Output $pgyo
}

Write-Output "`t],"

Write-Output "`t`"file`": ["
$first = $true
$pgyo = ""
foreach ($file in $files)
{
	if ($first)
	{
		$first = $false
	} else {
		Write-output "${pgyo},"
	}
	$outfile = $file -replace "\\", "/"
	$pgyo = "`t`t`{`"name`": `"$outfile`"}"
}
if ($pgyo -ne "") {
	Write-Output $pgyo
}

Write-Output "`t]"
Write-output "}"

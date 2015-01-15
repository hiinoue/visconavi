#
function jsonize()
{
	begin
	{
		$first = $true
	}
	process
	{
		if ($first)
		{
			$first = $false
		} else {
			Write-output "${pgyo},"
		}
		$pgyo = "`t`t`"$_`""
	}
	end
	{
		Write-Output $pgyo
	}
}

$specdir = "catalog"
$dirs = @()
Write-Output "{"
$files = Get-ChildItem -path $specdir -recurse -name -include *.jpg,*.png -exclude *コピ*
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
		$pgyo = "`t`t`"$specdir/$outdir`""
	}
}
if ($pgyo -ne "") {
	Write-Output $pgyo
}

Write-Output "`t],"

Write-Output "`t`"file`": ["
### Get-ChildItem . -recurse -name -include *.jpg,*.png -exclude *コピ* | ForEach-Object {$_ -replace "\\", "/"} | jsonize

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
	$pgyo = "`t`t{`"name`": `"$specdir/$outfile`"}"
}
if ($pgyo -ne "") {
	Write-Output $pgyo
}

Write-Output "`t]"
Write-output "}"

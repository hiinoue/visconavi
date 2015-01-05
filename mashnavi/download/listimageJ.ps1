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

Write-Output "{"
Write-Output "`timagefile: ["
# Get-ChildItem . -recurse -name -include *.jpg,*.png -exclude *_*,*コピ* | ForEach-Object {$_ -replace "\\", "/"} | ForEach-Object {Write-Output "`t`t`"$_`","}
Get-ChildItem . -recurse -name -include *.jpg,*.png -exclude *_*,*コピ* | ForEach-Object {$_ -replace "\\", "/"} | jsonize
Write-Output "`t]"
Write-output "}"

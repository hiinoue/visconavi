#
#	�_�E�����[�h���K�v�ȉ摜�t�@�C���i�y�ѕK�v�ȃf�B���N�g���j�����X�g�A�b�v#			�iXML�`���j
#
$prefix = "catalog"
$dirs = @()
Write-Output "<imagefiles>"
<#
Get-ChildItem catalog -recurse -name -include *.jpg,*.png -exclude *_*,*�R�s* | ForEach-Object {$dir = Split-path $_ -Parent; if (-Not ($dirs -contains $dir)) {$dirs += $dir}; $_ -replace "\\", "/"} | ForEach-Object {Write-Output "`t<file name=`"$prefix/$_`"/>"}
foreach ($dir in $dirs)
{
	if ($dir -ne "") {
		$outdir = $dir -replace "\\", "/"
		Write-Output "`t<dir name=`"$prefix/$outdir`"/>"
	}
}
#>
$files = Get-ChildItem catalog -recurse -name -include *.jpg,*.png -exclude *�R�s*
foreach ($file in $files)
{
	$dir = Split-path $file -Parent
	if (-Not ($dirs -contains $dir)) {
		$dirs += $dir
		if ($dir -ne "") {
			$outdir = $dir -replace "\\", "/"
			Write-Output "`t<dir name=`"$prefix/$outdir`"/>"
		}
	}
	$outfile = $file -replace "\\", "/"
	Write-Output "`t<file name=`"$prefix/$outfile`"/>"
}
Write-Output "</imagefiles>"

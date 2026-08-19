$srcRoot = "D:\website\Book-My-Event\Mobile_App\src"
$files = Get-ChildItem -Path $srcRoot -Recurse -Filter "*.js"
$count = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $changed = $false

    # All variants of Services/api relative paths -> @Services/api alias
    $patterns = @(
        "'../../../../Services/api'",
        '"../../../../Services/api"',
        "'../../../Services/api'",
        '"../../../Services/api"',
        "'../../Services/api'",
        '"../../Services/api"',
        "'../Services/api'",
        '"../Services/api"'
    )
    foreach ($p in $patterns) {
        if ($content.Contains($p)) {
            $content = $content.Replace($p, '"@Services/api"')
            $changed = $true
        }
    }

    # Redux path variants -> @Redux/
    $reduxPatterns = @(
        "'../../Redux/",
        '"../../Redux/',
        "'../Redux/",
        '"../Redux/'
    )
    foreach ($p in $reduxPatterns) {
        if ($content.Contains($p)) {
            $content = $content.Replace($p, '"@Redux/')
            $changed = $true
        }
    }

    # Fix typo: getEventshow -> getEventsshow
    if ($content.Contains("getEventshow")) {
        $content = $content.Replace("getEventshow", "getEventsshow")
        $changed = $true
    }

    if ($changed) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        $count++
        Write-Host "Fixed: $($file.Name)"
    }
}
Write-Host "`nTotal files fixed: $count"

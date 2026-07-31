Add-Type -AssemblyName System.Drawing

$logoPath = "C:\Users\subha\.gemini\antigravity\brain\b8b0691a-412a-4126-88d4-89980ed5a357\resume_builder_logo_1785485551172.jpg"
$ogPath = "C:\Users\subha\.gemini\antigravity\brain\b8b0691a-412a-4126-88d4-89980ed5a357\og_image_web_1785485565520.jpg"

function Resize-Image {
    param (
        [string]$SourcePath,
        [string]$DestinationPath,
        [int]$Width,
        [int]$Height
    )
    Write-Host "Resizing to $Width x $Height -> $DestinationPath"
    $src = [System.Drawing.Image]::FromFile($SourcePath)
    $dest = New-Object System.Drawing.Bitmap($Width, $Height)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, 0, 0, $Width, $Height)
    
    # Ensure directory exists
    $dir = Split-Path $DestinationPath
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    $dest.Save($DestinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $dest.Dispose()
    $src.Dispose()
}

# 1. Resize Logo
Resize-Image -SourcePath $logoPath -DestinationPath "public/favicon-16x16.png" -Width 16 -Height 16
Resize-Image -SourcePath $logoPath -DestinationPath "public/favicon-32x32.png" -Width 32 -Height 32
Resize-Image -SourcePath $logoPath -DestinationPath "public/apple-touch-icon.png" -Width 180 -Height 180
Resize-Image -SourcePath $logoPath -DestinationPath "public/android-chrome-192x192.png" -Width 192 -Height 192
Resize-Image -SourcePath $logoPath -DestinationPath "public/android-chrome-512x512.png" -Width 512 -Height 512
Resize-Image -SourcePath $logoPath -DestinationPath "public/icon-192.png" -Width 192 -Height 192
Resize-Image -SourcePath $logoPath -DestinationPath "public/icon-512.png" -Width 512 -Height 512

# Convert 32x32 to ICO
Write-Host "Creating favicon.ico"
$src32 = [System.Drawing.Bitmap]::FromFile("public/favicon-32x32.png")
$hIcon = $src32.GetHicon()
$ico = [System.Drawing.Icon]::FromHandle($hIcon)
$stream = New-Object System.IO.FileStream("public/favicon.ico", [System.IO.FileMode]::Create)
$ico.Save($stream)
$stream.Close()
$ico.Dispose()
$src32.Dispose()

# 2. Resize OG Image to 1200x630
Resize-Image -SourcePath $ogPath -DestinationPath "public/og-image.png" -Width 1200 -Height 630

Write-Host "Branding assets generated successfully!"

# High-Resolution Image Upgrade Guide

## Current vs High-Resolution URLs

### Water
- Current: `https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Water_molecule.svg/200px-Water_molecule.svg.png`
- High-res: `https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Water_molecule.svg/800px-Water_molecule.svg.png`

### Sodium Chloride
- Current: `https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Sodium-chloride-3D-ionic.png/200px-Sodium-chloride-3D-ionic.png`
- High-res: `https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Sodium-chloride-3D-ionic.png/800px-Sodium-chloride-3D-ionic.png`

### Carbon Dioxide
- Current: `https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Carbon-dioxide-3D-vdW.png/200px-Carbon-dioxide-3D-vdW.png`
- High-res: `https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Carbon-dioxide-3D-vdW.png/800px-Carbon-dioxide-3D-vdW.png`

### Methane
- Current: `https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Methane-CRC-MW-3D-balls.png/200px-Methane-CRC-MW-3D-balls.png`
- High-res: `https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Methane-CRC-MW-3D-balls.png/800px-Methane-CRC-MW-3D-balls.png`

## Quick Upgrade Method

Replace `200px-` with `800px-` or `1200px-` in your Wikipedia URLs for instant high-resolution versions.

## Alternative High-Quality Sources

### PubChem URLs (if available)
- Water: `https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=962&t=l`
- Methane: `https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=297&t=l`
- Caffeine: `https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=2519&t=l`

### ChemSpider Structure Images
- Format: `https://www.chemspider.com/ImagesHandler.ashx?id=[CSID]&w=500&h=500`
- Need to find ChemSpider ID for each compound

## Resolution Guidelines

- **Gallery cards**: 300x300px minimum
- **Detail pages**: 600x600px or larger
- **Print quality**: 1200px+ or vector (SVG)
- **File formats**: PNG > SVG > JPG for molecular structures

import re

file_path = r'c:\1-Data\Sites\Dual Websites\Final Working Stacks\Report Gen\Working Repo warp\Emigration Pro-front end-11-22\src\react-app\pages\SampleReport.tsx'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        matches = [m.start() for m in re.finditer(r'partial', content, re.IGNORECASE)]
        print(f"Found {len(matches)} matches for 'partial'")
        for i, pos in enumerate(matches):
            start = max(0, pos - 50)
            end = min(len(content), pos + 50)
            print(f"Match {i+1} context: ...{content[start:end].replace(chr(10), ' ')}...")
            
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for i, line in enumerate(lines):
            if 'partial' in line.lower():
                print(f"Line {i+1}: {line.strip()}")

except Exception as e:
    print(f"Error: {e}")

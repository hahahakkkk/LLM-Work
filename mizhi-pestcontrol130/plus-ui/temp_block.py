from pathlib import Path
text = Path('src/views/process/disaster/warning/index.vue').read_text(encoding='utf-8')
parts = text.split('<el-card class="grid-item">')
if len(parts) >= 4:
    block = '<el-card class="grid-item">' + parts[3].split('</el-card>')[0] + '</el-card>'
    print(block)
else:
    print('not enough parts')

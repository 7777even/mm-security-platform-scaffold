import zipfile, os
src = r'd:/gkproject/mm-security-platform/frontend-scaffold/docs/安全管控平台设计说明.docx'
out_dir = r'd:/gkproject/mm-security-platform/frontend-scaffold/docs/_extracted_media'
print('OUT_DIR', out_dir)
os.makedirs(out_dir, exist_ok=True)
print('Created?', os.path.isdir(out_dir))
with zipfile.ZipFile(src) as z:
    for n in z.namelist():
        if n.startswith('word/media/') and not n.endswith('/'):
            data = z.read(n)
            base = os.path.basename(n).replace('/', '_')
            outp = os.path.join(out_dir, base)
            with open(outp, 'wb') as f:
                f.write(data)
            print(n, len(data), 'bytes', '->', outp)
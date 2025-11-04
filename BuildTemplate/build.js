const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('[AIT Build] .ait 패키지 생성 중...');

// app.json 읽기
const appJsonPath = path.join(__dirname, 'app.json');
const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// .ait 파일명 결정
const aitFileName = `${appConfig.appId || 'miniapp'}.ait`;
const outputPath = path.join(__dirname, 'dist');

// dist 폴더 생성
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const aitFilePath = path.join(outputPath, aitFileName);

// 기존 .ait 파일 삭제
if (fs.existsSync(aitFilePath)) {
  fs.unlinkSync(aitFilePath);
}

// ZIP 아카이브 생성
const output = fs.createWriteStream(aitFilePath);
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', () => {
  console.log(`[AIT Build] ✓ .ait 파일 생성 완료!`);
  console.log(`[AIT Build]   파일명: ${aitFileName}`);
  console.log(`[AIT Build]   크기: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`[AIT Build]   경로: ${aitFilePath}`);
});

archive.on('error', (err) => {
  console.error('[AIT Build] 오류:', err);
  process.exit(1);
});

archive.pipe(output);

// app.json 추가 (루트)
archive.file('app.json', { name: 'app.json' });

// web 폴더의 모든 내용 추가
const webPath = path.join(__dirname, 'web');
if (fs.existsSync(webPath)) {
  archive.directory(webPath, 'web');
} else {
  console.error('[AIT Build] web 폴더를 찾을 수 없습니다!');
  process.exit(1);
}

archive.finalize();

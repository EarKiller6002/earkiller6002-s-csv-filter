import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { config } from './config/index.js';
import { CsvFilterStream } from './utils/csv.js';

async function main() {
  const inputPath = path.resolve(process.cwd(), config.inputFile);
  const outputPath = path.resolve(process.cwd(), config.outputFile);

  if (!fs.existsSync(inputPath)) {
    console.error(`Ошибка: Входной файл не найден по пути "${config.inputFile}"`);
    process.exit(1);
  }

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Запуск фильтрации...');
  console.log(`Критерии: Критерий возраста >= ${config.minAge}, Город = "${config.cityFilter}"\n`);

  const readStream = fs.createReadStream(inputPath, { encoding: 'utf-8' });
  const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf-8' });
  const filterStream = new CsvFilterStream(config);

  try {
    await pipeline(readStream, filterStream, writeStream);
    
    console.log('#####################Статистика обработки##########################');
    console.log(`Всего строк обработано: ${filterStream.stats.total}`);
    console.log(`Строк прошло фильтр: ${filterStream.stats.matched}`);
    console.log(`Результат успешно сохранен в: ${config.outputFile}`);
  } catch (error) {
    console.error('Произошла ошибка при обработке потоков:', error.message);
    process.exit(1);
  }
}

main();
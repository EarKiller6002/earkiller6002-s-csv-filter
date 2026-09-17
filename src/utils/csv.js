import { Transform } from 'node:stream';

export class CsvFilterStream extends Transform {
  constructor(config) {
    super({ writableObjectMode: false, readableObjectMode: false });
    this.config = config;
    this.isHeader = true;
    this.headerFields = [];
    this.buffer = '';
    
    this.stats = {
      total: 0,
      matched: 0
    };
  }

  _transform(chunk, encoding, callback) {

    this.buffer += chunk.toString();
    const lines = this.buffer.split(/\r?\n/);
    

    this.buffer = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;

      if (this.isHeader) {
        this.headerFields = line.split(',');

        this.push(line + '\n');
        this.isHeader = false;
        continue;
      }

      this.stats.total++;
      const values = line.split(',');
      
      const row = this.headerFields.reduce((acc, field, index) => {
        acc[field.trim()] = values[index]?.trim();
        return acc;
      }, {});

      const age = parseInt(row.age, 10);
      const city = row.city;

      const ageMatch = !isNaN(age) && age >= this.config.minAge;
      const cityMatch = !this.config.cityFilter || city === this.config.cityFilter;

      if (ageMatch && cityMatch) {
        this.stats.matched++;
        this.push(line + '\n');
      }
    }

    callback();
  }

  _flush(callback) {

    if (this.buffer.trim()) {
      const values = this.buffer.split(',');
      if (!this.isHeader) {
        this.stats.total++;
        const row = this.headerFields.reduce((acc, field, index) => {
          acc[field.trim()] = values[index]?.trim();
          return acc;
        }, {});

        const age = parseInt(row.age, 10);
        const city = row.city;

        if (age >= this.config.minAge && (!this.config.cityFilter || city === this.config.cityFilter)) {
          this.stats.matched++;
          this.push(this.buffer + '\n');
        }
      }
    }
    callback();
  }
}
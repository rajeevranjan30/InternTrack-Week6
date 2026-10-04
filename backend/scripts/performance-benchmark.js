const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Task = require('../src/models/Task');

const DOCUMENTS = 1000;
const RUNS = 10;

async function measure(label, queryFactory) {
  await queryFactory();
  const times = [];
  for (let i = 0; i < RUNS; i += 1) {
    const start = process.hrtime.bigint();
    await queryFactory();
    times.push(Number(process.hrtime.bigint() - start) / 1e6);
  }
  const average = times.reduce((a,b) => a+b, 0) / times.length;
  return {
    label,
    averageMs: Number(average.toFixed(3)),
    minMs: Number(Math.min(...times).toFixed(3)),
    maxMs: Number(Math.max(...times).toFixed(3))
  };
}

async function main() {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  try {
    const owner = new mongoose.Types.ObjectId();
    const otherOwner = new mongoose.Types.ObjectId();
    const docs = Array.from({length: DOCUMENTS}, (_, i) => ({
      title: `Benchmark task ${i + 1}`,
      description: 'Performance benchmark data',
      owner: i % 5 === 0 ? otherOwner : owner,
      status: i % 4 === 0 ? 'Completed' : 'In progress',
      priority: 'medium',
      progress: i % 101,
      dueDate: new Date(Date.now() + i * 86400000)
    }));
    await Task.insertMany(docs);
    const filter = { owner };
    const sort = { dueDate: 1, createdAt: -1 };
    const result = await measure('With .lean()', () => Task.find(filter).sort(sort).lean());
    console.log('InternTrack Week 5 performance benchmark');
    console.log(`Documents: ${DOCUMENTS}; measured runs: ${RUNS}`);
    console.table([result]);
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });

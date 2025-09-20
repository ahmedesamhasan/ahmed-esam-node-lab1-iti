// cli.js
import { Command } from 'commander';
import * as repo from './usersRepo.js';

const app = new Command();
app.name('users').description('Users CRUD CLI').version('1.0.0');

app
  .command('add')
  .argument('<name...>', 'user name')
  .action(async (parts) => {
    const user = await repo.create(parts.join(' '));
    console.log('Created:', user);
  });

app.command('getall').action(async () => {
  const list = await repo.getAll();
  if (!list.length) return console.log('No users yet.');
  console.table(list);
});

app
  .command('getone')
  .argument('<id>', 'numeric id', Number)
  .action(async (id) => {
    const user = await repo.getOne(id);
    console.log(user || 'not found');
  });

app
  .command('edit')
  .argument('<id>', 'numeric id', Number)
  .argument('<name...>', 'new name')
  .action(async (id, parts) => {
    const user = await repo.update(id, parts.join(' '));
    console.log(user ? 'Updated:' : 'not found', user || '');
  });

app
  .command('remove')
  .argument('<id>', 'numeric id', Number)
  .action(async (id) => {
    const ok = await repo.removeOne(id);
    console.log(ok ? 'removed' : 'not found');
  });

app.parseAsync().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

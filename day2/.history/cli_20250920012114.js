import fs from 'fs/promises';

const data = await fs.readFile('./users.json', 'utf-8');
let parsedData = JSON.parse(data);
console.log('🚀 ~ parsedData:', parsedData);
// const [,, action, id] = process.argv;
// function getOne(id){
//     console.log(parsedData.find((user)=> user.id === parseInt(id)));
// }

// switch (action) {
//     case 'getone':
//         getOne(id)
//         break;

//     default:
//         break;
// }
//const newUser = {
// id: 3,
//Name: "Mona",
//};
//let arr = [];
//if (Array.isArray(parsedData)) parsedData.push(newUser);
//else parsedData = [parsedData, newUser];
//console.log("🚀 ~ parsedData:", parsedData);

//await fs.writeFile("./users.json", JSON.stringify(parsedData, null, 2));
if (!Array.isArray(parsedData)) parsedData = [parsedData];

const [, , rawAction, ...rest] = process.argv;
const action = (rawAction || '').toLowerCase();
const save = () => fs.writeFile('./users.json', JSON.stringify(parsedData, null, 2));
function nextIdFrom(arr) {
  const max = arr.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0);
  return max + 1;
}
const toNums = (arr) => arr.map(Number);
const validNums = (nums, min = 2) => nums.length >= min && !nums.some(Number.isNaN);

switch (action) {
  case 'add':
    const name = rest[0];
    if (!name) {
      console.error('error');
      break;
    }
    console.log('Name from CLI:', name);
    parsedData.push({ id: nextIdFrom(parsedData), Name: name });
    await save();
    break;
  case 'remove':
    {
      const nums = toNums(rest);
      if (!validNums(nums)) {
        console.error('need 1 valid id');
        break;
      }
      const id = nums[0];
      parsedData = parsedData.filter((u) => u.id !== id);
      save();
    }
    break;
  case 'getall':
    {
      if (!parsedData.length) console.log(' No users yet.');
      else console.table(parsedData);
    }
    break;
  case 'getone':
    {
      const nums = toNums(rest);
      if (!validNums(nums)) {
        console.error('need 1 valid id');
        break;
      }
      const id = nums[0];
      const user = parsedData.find((u) => u.id === id);
      if (!user) {
        console.error('user not found');
        break;
      }
      console.log(user);
    }
    break;
  case 'edit':
    {
      const nums = toNums(rest);
      if (!validNums(nums)) {
        console.error('need 1 valid id');
        break;
      }
      const id = nums[0];
      const user = parsedData.find((u) => u.id === id);
      if (!user) {
        console.error('user not found');
        break;
      }
      user.Name = rest[1];
      await save();
    }
    break;

  default:
    break;
}

// add name -> unique id
// remove id
// edit id www
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
